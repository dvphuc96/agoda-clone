<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    public function createReview(User $user, array $data): Review
    {
        $hotelId = $data['hotel_id'];

        $hasCompletedBooking = Booking::where('user_id', $user->id)
            ->whereHas('roomType', fn ($q) => $q->where('hotel_id', $hotelId))
            ->where('status', 'completed')
            ->exists();

        if (! $hasCompletedBooking) {
            throw new \InvalidArgumentException('You must have a completed booking at this hotel to leave a review.');
        }

        $alreadyReviewed = Review::where('user_id', $user->id)
            ->where('hotel_id', $hotelId)
            ->exists();

        if ($alreadyReviewed) {
            throw new \InvalidArgumentException('You have already reviewed this hotel.');
        }

        return DB::transaction(function () use ($user, $data) {
            return Review::create([
                'user_id' => $user->id,
                'hotel_id' => $data['hotel_id'],
                'booking_id' => $data['booking_id'] ?? null,
                'rating' => $data['rating'],
                'title' => $data['title'] ?? null,
                'comment' => $data['comment'] ?? null,
            ]);
        });
    }

    public function updateReview(Review $review, array $data): Review
    {
        if (! in_array($review->status, ['pending', 'rejected'])) {
            throw new \InvalidArgumentException('Only pending or rejected reviews can be updated.');
        }

        $review->fill($data);
        $review->status = 'pending';
        $review->save();

        return $review->fresh();
    }

    public function deleteReview(Review $review): void
    {
        $review->delete();
    }
}
