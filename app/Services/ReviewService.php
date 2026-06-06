<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
            $imagePaths = [];
            if (!empty($data['images'])) {
                $imagePaths = $this->uploadImages($data['images']);
            }

            return Review::create([
                'user_id' => $user->id,
                'hotel_id' => $data['hotel_id'],
                'booking_id' => $data['booking_id'] ?? null,
                'rating' => $data['rating'],
                'title' => $data['title'] ?? null,
                'comment' => $data['comment'] ?? null,
                'images' => $imagePaths,
            ]);
        });
    }

    public function updateReview(Review $review, array $data): Review
    {
        if (! in_array($review->status, ['pending', 'rejected'])) {
            throw new \InvalidArgumentException('Only pending or rejected reviews can be updated.');
        }

        return DB::transaction(function () use ($review, $data) {
            if (!empty($data['images'])) {
                $this->deleteImages($review->images ?? []);
                $data['images'] = $this->uploadImages($data['images']);
            }

            $review->fill($data);
            $review->status = 'pending';
            $review->save();

            return $review->fresh();
        });
    }

    public function deleteReview(Review $review): void
    {
        $this->deleteImages($review->images ?? []);
        $review->delete();
    }

    public function respondToReview(Review $review, string $response): Review
    {
        $review->update([
            'owner_response' => $response,
            'owner_responded_at' => now(),
        ]);

        return $review->fresh();
    }

    private function uploadImages(array $images): array
    {
        $paths = [];
        foreach (array_slice($images, 0, 5) as $image) {
            if ($image instanceof UploadedFile) {
                $paths[] = $image->store('reviews', 'public');
            }
        }
        return $paths;
    }

    private function deleteImages(array $paths): void
    {
        foreach ($paths as $path) {
            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
