<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hasDates = $this->check_in && $this->check_out;

        $priceBreakdown = null;
        $effectiveTotal = null;
        $averagePrice = null;

        if ($hasDates) {
            $priceService = app(\App\Services\PriceResolutionService::class);
            $resolved = $priceService->resolveTotalPrice($this->resource, $this->check_in, $this->check_out);
            $effectiveTotal = $resolved['total'];
            $averagePrice = $resolved['average_per_night'];
            $priceBreakdown = $resolved['breakdown'];
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'max_guests' => $this->max_guests,
            'bed_type' => $this->bed_type,
            'size_sqm' => $this->size_sqm,
            'price_per_night' => (float) $this->price_per_night,
            'effective_total' => $effectiveTotal,
            'average_per_night' => $averagePrice,
            'price_breakdown' => $priceBreakdown,
            'amenities' => $this->amenities,
            'total_rooms' => $this->total_rooms,
            'images' => HotelImageResource::collection($this->whenLoaded('images')),
            'hotel' => new HotelResource($this->whenLoaded('hotel')),
            'available_rooms' => $this->when(
                $hasDates,
                fn() => $this->getAvailableRoomsCount($this->check_in, $this->check_out)
            ),
        ];
    }
}
