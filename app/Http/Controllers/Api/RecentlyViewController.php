<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HotelResource;
use App\Services\RecentlyViewedService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecentlyViewController extends Controller
{
    public function __construct(
        private RecentlyViewedService $recentlyViewedService,
    ) {}

    public function index(Request $request)
    {
        $hotels = $this->recentlyViewedService->getRecentlyViewed($request->user());

        return HotelResource::collection($hotels);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
        ]);

        $this->recentlyViewedService->recordView($request->user(), $data['hotel_id']);

        return response()->json(['message' => 'Recorded.']);
    }
}
