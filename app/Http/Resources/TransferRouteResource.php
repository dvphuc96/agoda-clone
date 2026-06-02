<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransferRouteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'airport_code' => $this->airport_code,
            'airport_name' => $this->airport_name,
            'pickup_latitude' => $this->pickup_latitude,
            'pickup_longitude' => $this->pickup_longitude,
            'direction' => $this->direction,
            'price' => $this->price,
            'currency' => $this->currency,
            'duration_minutes' => $this->duration_minutes,
            'distance_meters' => $this->distance_meters,
            'distance_km' => $this->distance_meters ? round($this->distance_meters / 1000, 2) : null,
            'duration_seconds' => $this->duration_seconds,
            'base_fee' => $this->base_fee,
            'price_per_km' => $this->price_per_km,
            'price_override' => $this->price_override,
            'pricing_source' => $this->pricing_source,
            'is_active' => $this->is_active,
            'hotel' => new HotelResource($this->whenLoaded('hotel')),
            'vehicle_type' => new TransferVehicleTypeResource($this->whenLoaded('vehicleType')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
