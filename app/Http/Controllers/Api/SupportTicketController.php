<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketMessageRequest;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Resources\SupportTicketResource;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SupportTicketController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $tickets = SupportTicket::where('user_id', auth()->id())
            ->withCount('messages')
            ->orderBy('updated_at', 'desc')
            ->paginate(15);

        return SupportTicketResource::collection($tickets);
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $ticket = SupportTicket::create([
            ...$request->only(['subject', 'category', 'booking_code']),
            'user_id' => auth()->id(),
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => auth()->id(),
            'message' => $request->message,
        ]);

        $ticket->load('messages.user');

        return response()->json([
            'data' => new SupportTicketResource($ticket),
            'message' => 'Ticket created successfully',
        ], 201);
    }

    public function show(int $id): SupportTicketResource
    {
        $ticket = SupportTicket::where('user_id', auth()->id())
            ->where('id', $id)
            ->with(['messages.user'])
            ->firstOrFail();

        return new SupportTicketResource($ticket);
    }

    public function reply(StoreTicketMessageRequest $request, int $id): JsonResponse
    {
        $ticket = SupportTicket::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();

        if ($ticket->status === 'closed') {
            return response()->json(['message' => 'Ticket is closed'], 422);
        }

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => auth()->id(),
            'message' => $request->message,
        ]);

        if ($ticket->status === 'resolved') {
            $ticket->update(['status' => 'open']);
        }

        $message->load('user');

        return response()->json([
            'data' => new \App\Http\Resources\TicketMessageResource($message),
            'message' => 'Reply sent',
        ]);
    }
}
