<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HotelSearchRequest;
use App\Http\Resources\HotelResource;
use App\Http\Resources\RoomTypeResource;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HotelController extends Controller
{
    public function index(HotelSearchRequest $request): JsonResponse
    {
        $query = Hotel::where('status', 'active')
            ->with(['destination', 'images']);

        if ($request->destination) {
            $query->whereHas('destination', function ($q) use ($request) {
                $q->where('slug', $request->destination)
                  ->orWhere('name', 'like', "%{$request->destination}%");
            });
        }

        if ($request->star) {
            $query->where('star_rating', $request->star);
        }

        if ($request->filled(['price_min', 'price_max'])) {
            $query->whereHas('roomTypes', function ($q) use ($request) {
                $q->whereBetween('price_per_night', [$request->price_min, $request->price_max]);
            });
        }

        match ($request->sort) {
            'price_asc' => $query->join('room_types', 'hotels.id', '=', 'room_types.hotel_id')
                ->orderBy('room_types.price_per_night', 'asc'),
            'price_desc' => $query->join('room_types', 'hotels.id', '=', 'room_types.hotel_id')
                ->orderBy('room_types.price_per_night', 'desc'),
            'rating' => $query->orderBy('star_rating', 'desc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        $hotels = $query->paginate(12);
        return response()->json(HotelResource::collection($hotels));
    }

    public function show(string $slug): JsonResponse
    {
        $hotel = Hotel::where('slug', $slug)
            ->where('status', 'active')
            ->with(['destination', 'images', 'roomTypes.images'])
            ->firstOrFail();

        return response()->json(new HotelResource($hotel));
    }

    public function rooms(string $slug, Request $request): JsonResponse
    {
        $request->validate([
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
        ]);

        $hotel = Hotel::where('slug', $slug)->where('status', 'active')->firstOrFail();

        $roomTypes = $hotel->roomTypes()->with('images')->get()->map(function ($roomType) use ($request) {
            $roomType->check_in = $request->check_in;
            $roomType->check_out = $request->check_out;
            return $roomType;
        });

        return response()->json(RoomTypeResource::collection($roomTypes));
    }

    public function featured(): JsonResponse
    {
        $hotels = Hotel::where('status', 'active')
            ->with(['destination', 'images'])
            ->inRandomOrder()
            ->limit(6)
            ->get();

        return response()->json(HotelResource::collection($hotels));
    }
}
