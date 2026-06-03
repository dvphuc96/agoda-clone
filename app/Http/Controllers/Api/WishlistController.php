<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HotelResource;
use App\Models\Hotel;
use App\Services\WishlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function __construct(private WishlistService $wishlistService) {}

    public function index(Request $request)
    {
        $wishlists = $this->wishlistService->getUserWishlists($request->user());

        $hotels = $wishlists->pluck('hotel')->filter();

        return HotelResource::collection($hotels);
    }

    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'hotel_id' => ['required', 'integer', 'exists:hotels,id'],
        ]);

        $result = $this->wishlistService->toggle(
            $request->user(),
            $request->input('hotel_id')
        );

        return response()->json($result);
    }

    public function destroy(Request $request, int $hotel): JsonResponse
    {
        $this->wishlistService->toggle($request->user(), $hotel);

        return response()->json(['is_wishlisted' => false]);
    }

    public function check(Request $request, int $hotel): JsonResponse
    {
        $isWishlisted = $this->wishlistService->isInWishlist($request->user(), $hotel);

        return response()->json(['is_wishlisted' => $isWishlisted]);
    }
}
