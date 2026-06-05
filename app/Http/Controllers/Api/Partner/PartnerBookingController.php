<?php

namespace App\Http\Controllers\Api\Partner;

use App\Http\Requests\UpdatePartnerBookingStatusRequest;
use App\Http\Resources\BookingResource;
use App\Models\AuditLog;
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

    public function updateStatus(UpdatePartnerBookingStatusRequest $request, Booking $booking): BookingResource
    {
        $hotelIds = $this->ownedHotelIds();

        $bookingHotelId = $booking->roomType?->hotel_id;

        if (!$bookingHotelId || !in_array($bookingHotelId, $hotelIds)) {
            abort(403, 'You do not have access to this booking.');
        }

        if ($booking->status !== 'pending') {
            abort(422, 'Only pending bookings can be updated.');
        }

        $oldStatus = $booking->status;
        $newStatus = $request->validated('status');

        $booking->update(['status' => $newStatus]);

        AuditLog::log('partner_status_update', $booking, [
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'updated_by' => auth()->id(),
        ]);

        return new BookingResource($booking->load(['user', 'roomType.hotel.location', 'payments', 'refunds']));
    }
}
