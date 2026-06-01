<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RefundResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'payment_id' => $this->payment_id,
            'amount' => $this->amount,
            'reason' => $this->reason,
            'status' => $this->status,
            'admin_notes' => $this->admin_notes,
            'processed_at' => $this->processed_at?->format('Y-m-d H:i:s'),
            'booking' => new BookingResource($this->whenLoaded('booking')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'requester' => $this->whenLoaded('requester', fn () => [
                'id' => $this->requester->id,
                'name' => $this->requester->name,
                'email' => $this->requester->email,
            ]),
            'processor' => $this->whenLoaded('processor', fn () => [
                'id' => $this->processor->id,
                'name' => $this->processor->name,
            ]),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
