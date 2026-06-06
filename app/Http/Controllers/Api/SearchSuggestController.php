<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchSuggestController extends Controller
{
    public function __construct(
        private CacheService $cache,
    ) {}

    public function suggest(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $q = trim($request->q);

        $cacheKey = $this->cache->hotelSearchKey(['suggest' => $q]);

        $results = $this->cache->remember($cacheKey, 300, function () use ($q) {
            return Hotel::where('status', 'active')
                ->select(['id', 'name', 'slug', 'star_rating', 'address'])
                ->selectRaw('MATCH(name, description, address) AGAINST(? IN NATURAL LANGUAGE MODE) AS relevance_score', [$q])
                ->whereRaw('MATCH(name, description, address) AGAINST(? IN NATURAL LANGUAGE MODE)', [$q])
                ->with(['images' => function ($query) {
                    $query->orderBy('sort_order')->limit(1);
                }])
                ->orderByDesc('relevance_score')
                ->limit(10)
                ->get()
                ->map(fn ($hotel) => [
                    'id' => $hotel->id,
                    'name' => $hotel->name,
                    'slug' => $hotel->slug,
                    'star_rating' => $hotel->star_rating,
                    'address' => $hotel->address,
                    'thumbnail' => $hotel->images->first()?->image_path,
                ]);
        });

        return response()->json(['data' => $results]);
    }
}
