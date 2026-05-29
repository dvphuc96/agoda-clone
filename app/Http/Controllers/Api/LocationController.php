<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Http\Resources\HotelResource;
use App\Models\Location;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::withCount('hotels')->get();
        return LocationResource::collection($locations);
    }

    public function hotels(string $slug)
    {
        $location = Location::where('slug', $slug)->firstOrFail();
        $hotels = Hotel::where('location_id', $location->id)
            ->where('status', 'active')
            ->with(['location', 'images'])
            ->withMin('roomTypes', 'price_per_night')
            ->paginate(12);

        return HotelResource::collection($hotels);
    }
}
