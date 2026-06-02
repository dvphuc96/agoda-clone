<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingModificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'old_check_in' => $this->old_check_in->format('Y-m-d'),
            'old_check_out' => $this->old_check_out->format('Y-m-d'),
            'old_guests' => $this->old_guests,
            'old_total_price' => $this->old_total_price,
            'new_check_in' => $this->new_check_in->format('Y-m-d'),
            'new_check_out' => $this->new_check_out->format('Y-m-d'),
            'new_guests' => $this->new_guests,
            'new_total_price' => $this->new_total_price,
            'status' => $this->status,
            'admin_notes' => $this->admin_notes,
            'price_diff' => (float) $this->new_total_price - (float) $this->old_total_price,
            'old_nights' => $this->old_check_in->diffInDays($this->old_check_out),
            'new_nights' => $this->new_check_in->diffInDays($this->new_check_out),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'booking' => new BookingResource($this->whenLoaded('booking')),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
