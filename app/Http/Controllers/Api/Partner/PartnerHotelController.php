<?php

namespace App\Http\Controllers\Api\Partner;

use App\Http\Resources\HotelResource;
use App\Models\Hotel;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerHotelController extends PartnerController
{
    public function __construct(
        private CacheService $cache,
    ) {}
    public function index(Request $request)
    {
        $hotels = auth()->user()->ownedHotels()
            ->with(['location', 'images', 'roomTypes'])
            ->paginate($request->per_page ?? 15);

        return HotelResource::collection($hotels);
    }

    public function show(Hotel $hotel): HotelResource
    {
        $this->checkHotelOwnership($hotel->id);

        return new HotelResource($hotel->load(['location', 'images', 'roomTypes.images', 'reviews']));
    }

    public function update(Request $request, Hotel $hotel): HotelResource
    {
        $this->checkHotelOwnership($hotel->id);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['sometimes', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'star_rating' => ['sometimes', 'integer', 'between:1,5'],
            'checkin_time' => ['nullable', 'string'],
            'checkout_time' => ['nullable', 'string'],
            'amenities' => ['nullable', 'array'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
        ]);

        $hotel->update($data);

        $this->cache->forgetHotel($hotel->slug);

        return new HotelResource($hotel->refresh()->load(['location', 'images', 'roomTypes']));
    }
}
