<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'max_guests' => $this->max_guests,
            'bed_type' => $this->bed_type,
            'size_sqm' => $this->size_sqm,
            'price_per_night' => $this->price_per_night,
            'amenities' => $this->amenities,
            'total_rooms' => $this->total_rooms,
            'images' => HotelImageResource::collection($this->whenLoaded('images')),
            'hotel' => new HotelResource($this->whenLoaded('hotel')),
            'available_rooms' => $this->when(
                $this->check_in && $this->check_out,
                fn() => $this->getAvailableRoomsCount($this->check_in, $this->check_out)
            ),
        ];
    }
}
