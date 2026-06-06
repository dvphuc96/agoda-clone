<?php

namespace App\Http\Controllers\Api\Partner;

use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerReviewController extends PartnerController
{
    public function respond(Request $request, Review $review, ReviewService $reviewService): JsonResponse
    {
        $request->validate([
            'response' => 'required|string|max:1000',
        ]);

        $hotelIds = $this->ownedHotelIds();

        if (!in_array($review->hotel_id, $hotelIds)) {
            abort(403, 'You can only respond to reviews for your own hotels.');
        }

        if ($review->owner_response) {
            return response()->json(['message' => 'A response has already been submitted for this review.'], 422);
        }

        $review = $reviewService->respondToReview($review, $request->response);

        return response()->json([
            'message' => 'Response submitted successfully.',
            'data' => new ReviewResource($review),
        ]);
    }
}
