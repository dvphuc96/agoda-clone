<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OccupancyDataResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'date' => $this['date'],
            'total_rooms' => (int) $this['total_rooms'],
            'booked_rooms' => (int) $this['booked_rooms'],
            'rate' => (float) $this['rate'],
        ];
    }
}
