<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HotelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $currency = app('currency') ?? 'VND';
        $currencyService = app(\App\Services\CurrencyService::class);

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
            'converted' => $this->when($currency !== 'VND' && $this->relationLoaded('roomTypes'), function () use ($currency, $currencyService) {
                $min = $this->roomTypes->min('price_per_night');
                $max = $this->roomTypes->max('price_per_night');
                return [
                    'currency' => $currency,
                    'min_price' => $currencyService->convert((float) $min, $currency),
                    'max_price' => $currencyService->convert((float) $max, $currency),
                    'min_formatted' => $currencyService->format((float) $min, $currency),
                    'max_formatted' => $currencyService->format((float) $max, $currency),
                ];
            }),
            'reviews_count' => $this->whenLoaded('reviews', fn () => $this->reviews->where('status', 'approved')->count()),
            'avg_rating' => $this->whenLoaded('reviews', fn () => round($this->reviews->where('status', 'approved')->avg('rating') ?? 0, 1) ?: null),
            'latest_reviews' => ReviewResource::collection(
                $this->whenLoaded('reviews', fn () => $this->reviews->where('status', 'approved')->take(3))
            ),
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
