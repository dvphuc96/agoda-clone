<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'description' => $this->description,
            'discount_type' => $this->discount_type,
            'discount_value' => (float) $this->discount_value,
            'min_booking_value' => $this->min_booking_value ? (float) $this->min_booking_value : null,
            'max_uses' => $this->max_uses,
            'used_count' => $this->used_count,
            'remaining_uses' => $this->max_uses ? ($this->max_uses - $this->used_count) : null,
            'max_uses_per_user' => $this->max_uses_per_user,
            'starts_at' => $this->starts_at?->format('Y-m-d H:i:s'),
            'expires_at' => $this->expires_at?->format('Y-m-d H:i:s'),
            'is_active' => $this->is_active,
            'applicable_hotels' => $this->applicable_hotels,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}