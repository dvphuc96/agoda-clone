<?php

namespace App\Http\Controllers\Api\Partner;

use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class PartnerDashboardController extends PartnerController
{
    public function stats(): JsonResponse
    {
        $hotelIds = $this->ownedHotelIds();

        if (empty($hotelIds)) {
            return response()->json([
                'revenue' => ['total' => 0, 'month' => 0],
                'bookings_count' => ['total' => 0, 'month' => 0],
                'avg_rating' => null,
                'hotels_count' => 0,
            ]);
        }

        $monthStart = Carbon::now()->startOfMonth();

        $bookingsBase = Booking::whereHas('roomType', fn ($q) => $q->whereIn('hotel_id', $hotelIds));
        $confirmedStatuses = ['confirmed', 'completed'];

        $totalRevenue = (clone $bookingsBase)
            ->whereIn('status', $confirmedStatuses)
            ->sum('total_price');

        $monthRevenue = (clone $bookingsBase)
            ->where('created_at', '>=', $monthStart)
            ->whereIn('status', $confirmedStatuses)
            ->sum('total_price');

        $totalBookings = (clone $bookingsBase)->count();
        $monthBookings = (clone $bookingsBase)
            ->where('created_at', '>=', $monthStart)
            ->count();

        $avgRating = Review::whereHas('hotel', fn ($q) => $q->whereIn('id', $hotelIds))
            ->where('status', 'approved')
            ->avg('rating');

        return response()->json([
            'revenue' => [
                'total' => (float) $totalRevenue,
                'month' => (float) $monthRevenue,
            ],
            'bookings_count' => [
                'total' => $totalBookings,
                'month' => $monthBookings,
            ],
            'avg_rating' => $avgRating ? round($avgRating, 1) : null,
            'hotels_count' => count($hotelIds),
        ]);
    }
}
