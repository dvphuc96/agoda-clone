<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingModification;
use App\Models\RoomType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BookingModificationService
{
    public function requestModification(Booking $booking, User $user, array $data): BookingModification
    {
        if (! in_array($booking->status, ['pending', 'confirmed'])) {
            throw new \InvalidArgumentException('Chi co the thay doi dat phong dang cho hoac da xac nhan');
        }

        if ($booking->check_in->isPast()) {
            throw new \InvalidArgumentException('Khong the thay doi dat phong da qua ngay nhan phong');
        }

        $newCheckIn = Carbon::parse($data['new_check_in']);
        $newCheckOut = Carbon::parse($data['new_check_out']);
        $nights = $newCheckIn->diffInDays($newCheckOut);

        if ($nights < 1) {
            throw new \InvalidArgumentException('Ngay tra phong phai sau ngay nhan phong');
        }

        if ($newCheckIn->isPast()) {
            throw new \InvalidArgumentException('Ngay nhan phong moi khong duoc o qua khu');
        }

        $roomType = $booking->roomType;
        $newTotalPrice = $roomType->price_per_night * $nights;

        return DB::transaction(function () use ($booking, $user, $data, $newTotalPrice) {
            $modification = BookingModification::create([
                'booking_id' => $booking->id,
                'user_id' => $user->id,
                'old_check_in' => $booking->check_in,
                'old_check_out' => $booking->check_out,
                'old_guests' => $booking->guests,
                'old_total_price' => $booking->total_price,
                'new_check_in' => $data['new_check_in'],
                'new_check_out' => $data['new_check_out'],
                'new_guests' => $data['new_guests'],
                'new_total_price' => $newTotalPrice,
                'status' => 'pending',
            ]);

            if ($booking->status === 'pending') {
                $this->approveModification($modification);
            }

            return $modification->fresh();
        });
    }

    public function approveModification(BookingModification $modification, ?string $notes = null): Booking
    {
        if ($modification->status !== 'pending') {
            throw new \InvalidArgumentException('Chi co the duyet yeu cau dang cho');
        }

        return DB::transaction(function () use ($modification, $notes) {
            $modification->update([
                'status' => 'approved',
                'admin_notes' => $notes,
            ]);

            $booking = $modification->booking;
            $booking->update([
                'check_in' => $modification->new_check_in,
                'check_out' => $modification->new_check_out,
                'guests' => $modification->new_guests,
                'total_price' => $modification->new_total_price,
                'modified_at' => now(),
            ]);

            return $booking->fresh();
        });
    }

    public function rejectModification(BookingModification $modification, ?string $notes = null): BookingModification
    {
        if ($modification->status !== 'pending') {
            throw new \InvalidArgumentException('Chi co the tu choi yeu cau dang cho');
        }

        $modification->update([
            'status' => 'rejected',
            'admin_notes' => $notes,
        ]);

        return $modification->fresh();
    }
}
