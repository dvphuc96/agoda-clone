<?php

namespace App\Http\Requests;

use App\Models\Booking;
use App\Models\Review;
use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'comment' => ['nullable', 'string', 'max:1000'],
            'hotel_id' => ['required', 'exists:hotels,id'],
            'booking_id' => ['nullable', 'exists:bookings,id'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $userId = $this->user()->id;
            $hotelId = $this->input('hotel_id');

            $hasCompletedBooking = Booking::where('user_id', $userId)
                ->whereHas('roomType', fn ($q) => $q->where('hotel_id', $hotelId))
                ->where('status', 'completed')
                ->exists();

            if (! $hasCompletedBooking) {
                $validator->errors()->add('hotel_id', 'You must have a completed booking at this hotel to leave a review.');
            }

            $alreadyReviewed = Review::where('user_id', $userId)
                ->where('hotel_id', $hotelId)
                ->exists();

            if ($alreadyReviewed) {
                $validator->errors()->add('hotel_id', 'You have already reviewed this hotel.');
            }
        });
    }
}
