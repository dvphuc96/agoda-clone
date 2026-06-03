<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomTypeResource;
use App\Models\Booking;
use App\Models\RoomType;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomTypeController extends Controller
{
    public function show(RoomType $roomType, Request $request)
    {
        $roomType->load(['hotel.location', 'images']);

        if ($request->filled(['check_in', 'check_out'])) {
            $request->validate([
                'check_in' => ['date', 'after_or_equal:today'],
                'check_out' => ['date', 'after:check_in'],
            ]);
            $roomType->check_in = $request->check_in;
            $roomType->check_out = $request->check_out;
        }

        return new RoomTypeResource($roomType);
    }

    /**
     * Get room availability calendar for a given month.
     */
    public function availabilityCalendar(RoomType $roomType, Request $request): JsonResponse
    {
        $month = $request->input('month', now()->format('Y-m'));

        $request->validate([
            'month' => ['sometimes', 'date_format:Y-m'],
        ]);

        $startDate = Carbon::parse($month . '-01');
        $endDate = $startDate->copy()->endOfMonth();

        // Get bookings that overlap with this month for this room type
        $bookings = Booking::where('room_type_id', $roomType->id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) use ($startDate, $endDate) {
                $q->where('check_in', '<=', $endDate)
                    ->where('check_out', '>=', $startDate);
            })
            ->get();

        // Calculate available rooms per day
        $calendar = [];
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $dateString = $currentDate->format('Y-m-d');

            $bookedCount = $bookings->filter(function ($booking) use ($dateString) {
                $checkIn = $booking->check_in->format('Y-m-d');
                $checkOut = $booking->check_out->format('Y-m-d');

                return $dateString >= $checkIn && $dateString < $checkOut;
            })->count();

            $calendar[] = [
                'date' => $dateString,
                'available' => max(0, $roomType->total_rooms - $bookedCount),
                'total' => $roomType->total_rooms,
            ];

            $currentDate->addDay();
        }

        return response()->json(['data' => $calendar]);
    }
}
