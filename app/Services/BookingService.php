<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\RoomType;
use App\Models\TransferRoute;
use App\Models\User;
use App\Notifications\BookingConfirmedNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BookingService
{
    public function __construct(private TransferBookingService $transferBookingService) {}

    public function createBooking(User $user, array $data): Booking
    {
        return DB::transaction(function () use ($user, $data) {
            $roomType = RoomType::findOrFail($data['room_type_id']);

            $checkIn = Carbon::parse($data['check_in']);
            $checkOut = Carbon::parse($data['check_out']);
            $nights = $checkIn->diffInDays($checkOut);

            if ($nights < 1) {
                throw new \InvalidArgumentException('Ngay tra phong phai sau ngay nhan phong');
            }

            $availableRooms = $roomType->getAvailableRoomsCount($data['check_in'], $data['check_out']);
            if ($availableRooms < 1) {
                throw new \InvalidArgumentException('Phong da het trong thoi gian ban chon');
            }

            $totalPrice = $roomType->price_per_night * $nights;

            $booking = Booking::create([
                'user_id' => $user->id,
                'room_type_id' => $roomType->id,
                'check_in' => $data['check_in'],
                'check_out' => $data['check_out'],
                'guests' => $data['guests'] ?? 1,
                'special_requests' => $data['special_requests'] ?? null,
                'total_price' => $totalPrice,
                'status' => 'pending',
            ]);

            if (! empty($data['transfer_add_on'])) {
                $route = TransferRoute::findOrFail($data['transfer_add_on']['transfer_route_id']);
                if ((int) $route->hotel_id !== (int) $roomType->hotel_id) {
                    throw new \InvalidArgumentException('Tuyen xe khong thuoc khach san dang dat');
                }

                $transferData = [
                    ...$data['transfer_add_on'],
                    'passengers' => $data['guests'] ?? 1,
                ];
                $this->transferBookingService->createBooking($user, $transferData, $booking);
            }

            $booking->load('roomType.hotel');
            $user->notify(new BookingConfirmedNotification($booking));

            return $booking;
        });
    }

    public function cancelBooking(Booking $booking): Booking
    {
        if ($booking->status !== 'pending') {
            throw new \InvalidArgumentException('Chi co the huy dat phong dang cho xac nhan');
        }

        $booking->update(['status' => 'cancelled']);
        return $booking;
    }
}
