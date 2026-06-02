<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Review::with(['user', 'hotel']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('hotel_id')) {
            $query->where('hotel_id', $request->input('hotel_id'));
        }

        $reviews = $query->latest()->paginate($request->integer('per_page', 15));

        return ReviewResource::collection($reviews);
    }

    public function show(Review $review): JsonResponse
    {
        $review->load(['user', 'hotel', 'booking']);

        return response()->json(new ReviewResource($review));
    }

    public function updateStatus(Request $request, Review $review): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
        ]);

        $review->update(['status' => $data['status']]);

        return response()->json(new ReviewResource($review->load(['user', 'hotel'])));
    }

    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json(null, 204);
    }
}
