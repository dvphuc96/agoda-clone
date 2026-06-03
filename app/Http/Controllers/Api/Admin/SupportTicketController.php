<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketMessageRequest;
use App\Http\Resources\SupportTicketResource;
use App\Http\Resources\TicketMessageResource;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SupportTicketController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = SupportTicket::with(['user'])->withCount('messages');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('subject', 'like', "%{$request->search}%")
                    ->orWhere('booking_code', 'like', "%{$request->search}%");
            });
        }

        $tickets = $query->orderBy('updated_at', 'desc')->paginate($request->per_page ?? 20);

        return SupportTicketResource::collection($tickets);
    }

    public function show(int $id): SupportTicketResource
    {
        $ticket = SupportTicket::with(['user', 'messages.user'])->findOrFail($id);
        return new SupportTicketResource($ticket);
    }

    public function reply(StoreTicketMessageRequest $request, int $id): JsonResponse
    {
        $ticket = SupportTicket::findOrFail($id);

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => auth()->id(),
            'is_admin' => true,
            'message' => $request->message,
        ]);

        if ($ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        $message->load('user');

        return response()->json([
            'data' => new TicketMessageResource($message),
            'message' => 'Reply sent',
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:open,in_progress,resolved,closed'],
            'priority' => ['nullable', 'in:low,normal,high,urgent'],
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->update($request->only(['status', 'priority']));

        return response()->json([
            'data' => new SupportTicketResource($ticket->load('user')),
            'message' => 'Ticket updated',
        ]);
    }
}
