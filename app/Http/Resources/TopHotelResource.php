<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TopHotelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'hotel' => $this['hotel'],
            'revenue' => (float) $this['revenue'],
            'bookings' => (int) $this['bookings'],
            'avg_rating' => $this['avg_rating'],
        ];
    }
}
