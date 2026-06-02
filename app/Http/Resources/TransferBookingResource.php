<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransferBookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_code' => $this->booking_code,
            'airport_code' => $this->airport_code,
            'airport_name' => $this->airport_name,
            'direction' => $this->direction,
            'pickup_datetime' => $this->pickup_datetime?->format('Y-m-d H:i:s'),
            'passengers' => $this->passengers,
            'contact_name' => $this->contact_name,
            'contact_phone' => $this->contact_phone,
            'flight_number' => $this->flight_number,
            'special_requests' => $this->special_requests,
            'total_price' => $this->total_price,
            'currency' => $this->currency,
            'status' => $this->status,
            'cancelled_at' => $this->cancelled_at?->format('Y-m-d H:i:s'),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
            ]),
            'hotel' => new HotelResource($this->whenLoaded('hotel')),
            'route' => new TransferRouteResource($this->whenLoaded('route')),
            'vehicle_type' => new TransferVehicleTypeResource($this->whenLoaded('vehicleType')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
