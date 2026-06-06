<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HotelCompareResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $approvedReviews = $this->reviews->where('status', 'approved');
        $roomTypes = $this->roomTypes;
        $currency = app('currency') ?? 'VND';
        $currencyService = app(\App\Services\CurrencyService::class);

        $minPrice = (float) $roomTypes->min('price_per_night');
        $maxPrice = (float) $roomTypes->max('price_per_night');
        $avgPrice = (float) $roomTypes->avg('price_per_night');

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
            'checkin_time' => $this->checkin_time,
            'checkout_time' => $this->checkout_time,
            'amenities' => $this->amenities ?? [],
            'phone' => $this->phone,
            'location' => new LocationResource($this->whenLoaded('location')),
            'image' => $this->images->first() ? new HotelImageResource($this->images->first()) : null,
            'images' => HotelImageResource::collection($this->whenLoaded('images')),
            'pricing' => [
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'avg_price' => $avgPrice,
            ],
            'converted' => $this->when($currency !== 'VND', fn() => [
                'currency' => $currency,
                'min_price' => $currencyService->convert($minPrice, $currency),
                'max_price' => $currencyService->convert($maxPrice, $currency),
                'avg_price' => $currencyService->convert($avgPrice, $currency),
                'min_formatted' => $currencyService->format($minPrice, $currency),
                'max_formatted' => $currencyService->format($maxPrice, $currency),
                'avg_formatted' => $currencyService->format($avgPrice, $currency),
                'rooms' => $roomTypes->map(fn ($rt) => [
                    'id' => $rt->id,
                    'price_per_night' => $currencyService->convert((float) $rt->price_per_night, $currency),
                    'price_formatted' => $currencyService->format((float) $rt->price_per_night, $currency),
                ]),
            ]),
            'rooms_summary' => [
                'count' => $roomTypes->count(),
                'total_rooms' => $roomTypes->sum('total_rooms'),
                'max_guests' => $roomTypes->max('max_guests'),
                'types' => $roomTypes->map(fn ($rt) => [
                    'id' => $rt->id,
                    'name' => $rt->name,
                    'price_per_night' => (float) $rt->price_per_night,
                    'max_guests' => $rt->max_guests,
                    'bed_type' => $rt->bed_type,
                    'size_sqm' => $rt->size_sqm,
                    'amenities' => $rt->amenities ?? [],
                    'image' => $rt->images->first() ? new HotelImageResource($rt->images->first()) : null,
                ]),
            ],
            'reviews_summary' => [
                'count' => $approvedReviews->count(),
                'avg_rating' => round($approvedReviews->avg('rating') ?? 0, 1) ?: null,
                'rating_distribution' => collect(range(1, 5))->mapWithKeys(fn ($r) => [
                    $r => $approvedReviews->where('rating', $r)->count(),
                ]),
            ],
        ];
    }
}
