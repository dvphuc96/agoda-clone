<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Hotel;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviewService) {}

    public function index(Request $request, string $hotelSlug): AnonymousResourceCollection
    {
        $hotel = Hotel::where('slug', $hotelSlug)->firstOrFail();

        $reviews = Review::where('hotel_id', $hotel->id)
            ->where('status', 'approved')
            ->with('user')
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return ReviewResource::collection($reviews);
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $data = $request->validated();
        if ($request->hasFile('images')) {
            $data['images'] = $request->file('images');
        }

        $review = $this->reviewService->createReview($request->user(), $data);

        return response()->json(new ReviewResource($review->load('user')), 201);
    }

    public function update(Request $request, Review $review): JsonResponse
    {
        if ($review->user_id !== $request->user()->id) {
            abort(403, 'You can only update your own reviews.');
        }

        $data = $request->validate([
            'rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'comment' => ['nullable', 'string', 'max:1000'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('images')) {
            $data['images'] = $request->file('images');
        }

        $review = $this->reviewService->updateReview($review, $data);

        return response()->json(new ReviewResource($review->load('user')));
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        if ($review->user_id !== $request->user()->id) {
            abort(403, 'You can only delete your own reviews.');
        }

        $this->reviewService->deleteReview($review);

        return response()->json(null, 204);
    }
}
