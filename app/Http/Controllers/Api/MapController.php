<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MapController extends Controller
{
    public function hotels(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ne_lat' => ['required', 'numeric', 'between:-90,90'],
            'ne_lng' => ['required', 'numeric', 'between:-180,180'],
            'sw_lat' => ['required', 'numeric', 'between:-90,90'],
            'sw_lng' => ['required', 'numeric', 'between:-180,180'],
            'location_id' => ['sometimes', 'integer', 'exists:locations,id'],
        ]);

        $query = Hotel::where('status', 'active')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->whereBetween('latitude', [$validated['sw_lat'], $validated['ne_lat']])
            ->whereBetween('longitude', [$validated['sw_lng'], $validated['ne_lng']]);

        if (!empty($validated['location_id'])) {
            $query->where('location_id', $validated['location_id']);
        }

        $hotels = $query
            ->with(['images' => function ($q) {
                $q->orderBy('sort_order')->limit(1);
            }, 'roomTypes' => function ($q) {
                $q->orderBy('price_per_night', 'asc')->limit(1);
            }])
            ->paginate(100);

        return response()->json([
            'data' => $hotels->getCollection()->map(function ($hotel) {
                $thumbnail = $hotel->images->first()?->image_path;
                $minPrice = $hotel->roomTypes->first()?->price_per_night;

                return [
                    'id' => $hotel->id,
                    'name' => $hotel->name,
                    'slug' => $hotel->slug,
                    'latitude' => (float) $hotel->latitude,
                    'longitude' => (float) $hotel->longitude,
                    'star_rating' => $hotel->star_rating,
                    'thumbnail' => $thumbnail ? asset("storage/{$thumbnail}") : null,
                    'min_price' => $minPrice ? (float) $minPrice : null,
                ];
            }),
            'meta' => [
                'current_page' => $hotels->currentPage(),
                'last_page' => $hotels->lastPage(),
                'per_page' => $hotels->perPage(),
                'total' => $hotels->total(),
            ],
        ]);
    }
}
