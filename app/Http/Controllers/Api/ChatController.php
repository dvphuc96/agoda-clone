<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChatMessageResource;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ChatController extends Controller
{
    public function __construct(private ChatService $chatService) {}

    /**
     * Create a new chat session.
     */
    public function storeSession(Request $request): JsonResponse
    {
        $data = [];

        if ($request->user()) {
            $data['user_id'] = $request->user()->id;
        }

        if ($request->filled('context')) {
            $data['context'] = $request->input('context');
        }

        $session = ChatSession::create($data);

        return response()->json([
            'data' => [
                'id' => $session->id,
                'context' => $session->context,
                'created_at' => $session->created_at?->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * List the authenticated user's chat sessions.
     */
    public function getSessions(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $sessions = ChatSession::where('user_id', $request->user()->id)
            ->withCount('messages')
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => $sessions->map(fn ($s) => [
                'id' => $s->id,
                'context' => $s->context,
                'messages_count' => $s->messages_count,
                'created_at' => $s->created_at?->toIso8601String(),
            ]),
            'current_page' => $sessions->currentPage(),
            'last_page' => $sessions->lastPage(),
            'total' => $sessions->total(),
        ]);
    }

    /**
     * Send a message and receive an AI response.
     */
    public function sendMessage(Request $request, ChatSession $session): JsonResponse
    {
        $request->validate([
            'content' => ['required', 'string', 'max:2000'],
        ]);

        // Authorization: only the session owner or guest can send
        if ($session->user_id && $request->user()?->id !== $session->user_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // Create the user message
        $userMessage = ChatMessage::create([
            'session_id' => $session->id,
            'role' => 'user',
            'content' => $request->input('content'),
        ]);

        // Process and generate the assistant response
        $assistantContent = $this->chatService->processMessage($session, $request->input('content'));

        $assistantMessage = ChatMessage::create([
            'session_id' => $session->id,
            'role' => 'assistant',
            'content' => $assistantContent,
        ]);

        return response()->json([
            'data' => [
                'user_message' => new ChatMessageResource($userMessage),
                'assistant_message' => new ChatMessageResource($assistantMessage),
            ],
        ], 201);
    }

    /**
     * List all messages in a chat session.
     */
    public function getMessages(Request $request, ChatSession $session): AnonymousResourceCollection
    {
        // Authorization
        if ($session->user_id && $request->user()?->id !== $session->user_id) {
            abort(403, 'Forbidden.');
        }

        $messages = $session->messages()->orderBy('created_at')->get();

        return ChatMessageResource::collection($messages);
    }
}
