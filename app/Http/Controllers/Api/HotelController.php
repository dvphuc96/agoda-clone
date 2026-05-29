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
    public function index(HotelSearchRequest $request)
    {
        $query = Hotel::where('status', 'active')
            ->with(['location', 'images']);

        if ($request->location) {
            $query->whereHas('location', function ($q) use ($request) {
                $q->where('slug', $request->location)
                  ->orWhere('name', 'like', "%{$request->location}%");
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
        return HotelResource::collection($hotels->appends($request->query()));
    }

    public function show(string $slug)
    {
        $hotel = Hotel::where('slug', $slug)
            ->where('status', 'active')
            ->with(['location', 'images', 'roomTypes.images'])
            ->firstOrFail();

        return response()->json(new HotelResource($hotel));
    }

    public function rooms(string $slug, Request $request)
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

        return RoomTypeResource::collection($roomTypes);
    }

    public function featured()
    {
        $hotels = Hotel::where('status', 'active')
            ->with(['location', 'images'])
            ->inRandomOrder()
            ->limit(6)
            ->get();

        return HotelResource::collection($hotels);
    }
}
