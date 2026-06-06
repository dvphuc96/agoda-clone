<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PriceAlertResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'hotel_id' => $this->hotel_id,
            'target_price' => (float) $this->target_price,
            'is_active' => $this->is_active,
            'last_notified_at' => $this->last_notified_at?->toIso8601String(),
            'hotel' => [
                'id' => $this->hotel->id,
                'name' => $this->hotel->name,
                'slug' => $this->hotel->slug,
                'star_rating' => $this->hotel->star_rating,
                'thumbnail' => $this->hotel->images->first()?->url,
                'address' => $this->hotel->address,
            ],
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
