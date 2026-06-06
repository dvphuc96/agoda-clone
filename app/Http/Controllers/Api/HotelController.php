<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HotelSearchRequest;
use App\Http\Resources\HotelResource;
use App\Http\Resources\HotelCompareResource;
use App\Http\Resources\RoomTypeResource;
use App\Models\Hotel;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HotelController extends Controller
{
    public function __construct(
        private CacheService $cache,
    ) {}

    public function index(HotelSearchRequest $request)
    {
        $cacheKey = $this->cache->hotelSearchKey($request->query());

        return $this->cache->remember($cacheKey, $this->cache->getTtl('search'), function () use ($request) {
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

            if ($request->location) {
                $query->whereHas('location', function ($q) use ($request) {
                    $q->where('slug', $request->location)
                      ->orWhere('name', 'like', "%{$request->location}%");
                });
            }

            if ($q = trim((string) $request->q)) {
                $escaped = str_replace(['%', '_'], ['\\%', '\\_'], $q);
                $query->where(function ($query) use ($escaped) {
                    $query->where('name', 'like', "%{$escaped}%")
                          ->orWhere('description', 'like', "%{$escaped}%")
                          ->orWhere('address', 'like', "%{$escaped}%");
                });
                $query->selectRaw('*, MATCH(name, description, address) AGAINST(? IN BOOLEAN MODE) AS relevance_score', [$q]);
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

            $hasFulltext = trim((string) $request->q) !== '';

            match ($request->sort) {
                'price_asc' => $query->join('room_types', 'hotels.id', '=', 'room_types.hotel_id')
                    ->orderBy('room_types.price_per_night', 'asc'),
                'price_desc' => $query->join('room_types', 'hotels.id', '=', 'room_types.hotel_id')
                    ->orderBy('room_types.price_per_night', 'desc'),
                'rating' => $query->orderBy('star_rating', 'desc'),
                default => $hasFulltext
                    ? $query->orderByDesc('relevance_score')
                    : $query->orderBy('created_at', 'desc'),
            };

            $hotels = $query->paginate(12);
            return HotelResource::collection($hotels->appends($request->query()));
        }, ['search']);
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
        $cacheKey = $this->cache->hotelDetailKey($slug);

        return $this->cache->remember($cacheKey, $this->cache->getTtl('detail'), function () use ($slug) {
            $hotel = Hotel::where('slug', $slug)
                ->where('status', 'active')
                ->with(['location', 'images', 'roomTypes.images', 'reviews.user'])
                ->firstOrFail();

            return response()->json(new HotelResource($hotel));
        }, ['hotel:' . $slug]);
    }

    public function rooms(string $slug, Request $request)
    {
        $request->validate([
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
        ]);

        $cacheKey = $this->cache->hotelRoomsKey($slug, $request->check_in, $request->check_out);

        return $this->cache->remember($cacheKey, $this->cache->getTtl('rooms'), function () use ($slug, $request) {
            $hotel = Hotel::where('slug', $slug)->where('status', 'active')->firstOrFail();

            $roomTypes = $hotel->roomTypes()->with('images')->get()->map(function ($roomType) use ($request) {
                $roomType->check_in = $request->check_in;
                $roomType->check_out = $request->check_out;
                return $roomType;
            });

            return RoomTypeResource::collection($roomTypes);
        }, ['hotel:' . $slug]);
    }

    public function featured()
    {
        $cacheKey = $this->cache->featuredHotelsKey();

        return $this->cache->remember($cacheKey, $this->cache->getTtl('featured'), function () {
            $hotels = Hotel::where('status', 'active')
                ->with(['location', 'images', 'roomTypes'])
                ->inRandomOrder()
                ->limit(6)
                ->get();

            return HotelResource::collection($hotels);
        });
    }

    public function compare(Request $request)
    {
        $request->validate([
            'slugs' => 'required|string|min:1',
        ]);

        $slugs = collect(explode(',', $request->slugs))
            ->map(fn ($s) => trim($s))
            ->filter()
            ->unique()
            ->take(3)
            ->values();

        if ($slugs->count() < 2) {
            return response()->json(['message' => 'At least 2 hotels are required for comparison.'], 422);
        }

        $hotels = Hotel::where('status', 'active')
            ->whereIn('slug', $slugs)
            ->with([
                'location',
                'images',
                'roomTypes.images',
                'roomTypes.priceOverrides' => fn ($q) => $q->where('is_active', true),
                'reviews' => fn ($q) => $q->where('status', 'approved'),
            ])
            ->get()
            ->keyBy('slug');

        $ordered = $slugs->map(fn ($slug) => $hotels->get($slug))->filter();

        return response()->json([
            'data' => HotelCompareResource::collection($ordered),
        ]);
    }
}
