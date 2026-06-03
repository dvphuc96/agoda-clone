<?php

namespace App\Http\Controllers\Api\Partner;

use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\Request;

class PartnerBookingController extends PartnerController
{
    public function index(Request $request)
    {
        $hotelIds = $this->ownedHotelIds();

        $bookings = Booking::whereHas('roomType', fn ($q) => $q->whereIn('hotel_id', $hotelIds))
            ->with(['user', 'roomType.hotel', 'payments', 'refunds'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return BookingResource::collection($bookings);
    }

    public function show(Booking $booking): BookingResource
    {
        $hotelIds = $this->ownedHotelIds();

        $bookingHotelId = $booking->roomType?->hotel_id;

        if (!$bookingHotelId || !in_array($bookingHotelId, $hotelIds)) {
            abort(403, 'You do not have access to this booking.');
        }

        return new BookingResource($booking->load(['user', 'roomType.hotel.location', 'payments', 'refunds']));
    }
}
