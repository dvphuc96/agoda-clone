<?php

namespace App\Services;

use App\Models\TransferBooking;
use App\Models\TransferRoute;
use App\Models\User;
use App\Models\Booking;

class TransferBookingService
{
    public function createBooking(User $user, array $data, ?Booking $roomBooking = null): TransferBooking
    {
        $route = TransferRoute::query()
            ->with(['vehicleType', 'hotel.location'])
            ->where('is_active', true)
            ->findOrFail($data['transfer_route_id']);

        if (! $route->vehicleType || ! $route->vehicleType->is_active) {
            throw new \InvalidArgumentException('Loai xe khong kha dung');
        }

        if ((int) $data['passengers'] > $route->vehicleType->passenger_capacity) {
            throw new \InvalidArgumentException('So khach vuot qua suc chua cua xe');
        }

        return TransferBooking::create([
            'user_id' => $user->id,
            'booking_id' => $roomBooking?->id,
            'transfer_route_id' => $route->id,
            'transfer_vehicle_type_id' => $route->vehicleType->id,
            'hotel_id' => $route->hotel_id,
            'airport_code' => $route->airport_code,
            'airport_name' => $route->airport_name,
            'direction' => $route->direction,
            'pickup_datetime' => $data['pickup_datetime'],
            'passengers' => $data['passengers'],
            'contact_name' => $data['contact_name'],
            'contact_phone' => $data['contact_phone'],
            'flight_number' => $data['flight_number'] ?? null,
            'special_requests' => $data['special_requests'] ?? null,
            'total_price' => $route->price,
            'currency' => $route->currency,
            'status' => 'pending',
        ]);
    }

    public function cancelBooking(TransferBooking $booking): TransferBooking
    {
        if (! in_array($booking->status, ['pending', 'confirmed'], true)) {
            throw new \InvalidArgumentException('Khong the huy don xe o trang thai hien tai');
        }

        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return $booking;
    }
}
