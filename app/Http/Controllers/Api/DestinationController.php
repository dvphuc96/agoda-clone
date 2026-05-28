<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DestinationResource;
use App\Http\Resources\HotelResource;
use App\Models\Destination;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;

class DestinationController extends Controller
{
    public function index(): JsonResponse
    {
        $destinations = Destination::withCount('hotels')->get();
        return response()->json(DestinationResource::collection($destinations));
    }

    public function hotels(string $slug): JsonResponse
    {
        $destination = Destination::where('slug', $slug)->firstOrFail();
        $hotels = Hotel::where('destination_id', $destination->id)
            ->where('status', 'active')
            ->with(['destination', 'images'])
            ->withMin('roomTypes', 'price_per_night')
            ->paginate(12);

        return response()->json(HotelResource::collection($hotels));
    }
}
