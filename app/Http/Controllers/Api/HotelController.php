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
        $hasRoomTypeFilters = $request->filled('guests')
            || $request->filled('price_min')
            || $request->filled('price_max')
            || $request->filled(['check_in', 'check_out']);

        $query = Hotel::where('status', 'active')
            ->with([
                'location',
                'images',
                'roomTypes' => function ($q) use ($request, $hasRoomTypeFilters) {
                    if ($hasRoomTypeFilters) {
                        $this->applyRoomTypeSearchFilters($q, $request);
                    }
                },
            ]);

        if ($request->user()) {
            $query->withCount([
                'wishlists as user_has_wishlisted' => function ($q) use ($request) {
                    $q->where('user_id', $request->user()->id);
                },
            ]);
        }

        if ($request->location) {
            $query->whereHas('location', function ($q) use ($request) {
                $q->where('slug', $request->location)
                  ->orWhere('name', 'like', "%{$request->location}%");
            });
        }

        if ($q = trim((string) $request->q)) {
            $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $q);
            $query->whereRaw('LOWER(name) LIKE LOWER(?) ESCAPE ?', ['%' . $escaped . '%', '\\']);
        }

        if ($request->star) {
            $query->where('star_rating', $request->star);
        }

        if ($hasRoomTypeFilters) {
            $query->whereHas('roomTypes', function ($q) use ($request) {
                $this->applyRoomTypeSearchFilters($q, $request);
            });
        }

        if ($request->types) {
            $types = collect(explode(',', $request->types))
                ->map(fn ($type) => trim($type))
                ->intersect(['hotel', 'villa', 'resort', 'apartment'])
                ->filter()
                ->values();

            if ($types->isNotEmpty()) {
                $query->whereIn('property_type', $types);
            }
        }

        if ($request->amenities) {
            $amenities = collect(explode(',', $request->amenities))
                ->map(fn ($amenity) => trim($amenity))
                ->filter()
                ->values();

            foreach ($amenities as $amenity) {
                $query->where(function ($q) use ($amenity) {
                    $q->whereJsonContains('amenities', $amenity)
                        ->orWhereHas('roomTypes', function ($roomQuery) use ($amenity) {
                            $roomQuery->whereJsonContains('amenities', $amenity);
                        });
                });
            }
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

    private function applyRoomTypeSearchFilters($query, HotelSearchRequest $request): void
    {
        if ($request->filled('guests')) {
            $query->where('max_guests', '>=', $request->guests);
        }

        if ($request->filled('price_min')) {
            $query->where('price_per_night', '>=', $request->price_min);
        }

        if ($request->filled('price_max')) {
            $query->where('price_per_night', '<=', $request->price_max);
        }

        if ($request->filled(['check_in', 'check_out'])) {
            $query->whereDoesntHave('bookings', function ($bookingQuery) use ($request) {
                $bookingQuery->where('status', '!=', 'cancelled')
                    ->where('check_in', '<', $request->check_out)
                    ->where('check_out', '>', $request->check_in);
            });
        }
    }

    public function show(string $slug)
    {
        $hotel = Hotel::where('slug', $slug)
            ->where('status', 'active')
            ->with(['location', 'images', 'roomTypes.images', 'reviews.user'])
            ->when(auth()->check(), function ($q) {
                $q->with(['wishlists' => function ($q) {
                    $q->where('user_id', auth()->id());
                }]);
            })
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
            ->with(['location', 'images', 'roomTypes'])
            ->inRandomOrder()
            ->limit(6)
            ->get();

        return HotelResource::collection($hotels);
    }
}
