<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HotelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'property_type' => $this->property_type,
            'description' => $this->description,
            'address' => $this->address,
            'star_rating' => $this->star_rating,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'phone' => $this->phone,
            'email' => $this->email,
            'checkin_time' => $this->checkin_time,
            'checkout_time' => $this->checkout_time,
            'amenities' => $this->amenities,
            'status' => $this->status,
            'location' => new LocationResource($this->whenLoaded('location')),
            'images' => HotelImageResource::collection($this->whenLoaded('images')),
            'room_types' => RoomTypeResource::collection($this->whenLoaded('roomTypes')),
            'min_price' => $this->whenLoaded('roomTypes', function () {
                return $this->roomTypes->min('price_per_night');
            }),
            'max_price' => $this->whenLoaded('roomTypes', function () {
                return $this->roomTypes->max('price_per_night');
            }),
            'is_wishlisted' => $this->when(auth()->check(), function () {
                if (isset($this->user_has_wishlisted)) {
                    return (bool) $this->user_has_wishlisted;
                }
                if ($this->relationLoaded('wishlists')) {
                    return $this->wishlists->contains('user_id', auth()->id());
                }
                return false;
            }),
        ];
    }
}
