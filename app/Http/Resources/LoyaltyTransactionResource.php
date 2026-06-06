<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoyaltyTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'points' => $this->points,
            'description' => $this->description,
            'reference' => $this->reference,
            'booking_code' => $this->whenLoaded('booking', fn () => $this->booking?->booking_code),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
