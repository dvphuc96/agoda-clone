<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RevenuePointResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'date' => $this['date'],
            'revenue' => (float) $this['revenue'],
            'booking_count' => (int) $this['booking_count'],
        ];
    }
}
