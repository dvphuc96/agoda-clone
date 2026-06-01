<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\NotificationRecord;
use App\Models\Refund;
use App\Models\User;

class NotificationService
{
    public function create(User $user, ?Booking $booking, string $type, string $channel = 'database', ?array $payload = null): NotificationRecord
    {
        return NotificationRecord::create([
            'user_id' => $user->id,
            'booking_id' => $booking?->id,
            'type' => $type,
            'channel' => $channel,
            'status' => 'sent',
            'payload' => $payload,
            'sent_at' => now(),
        ]);
    }

    public function notifyBookingConfirmed(Booking $booking): NotificationRecord
    {
        return $this->create(
            $booking->user,
            $booking,
            'booking_confirmed',
            'database',
            [
                'booking_code' => $booking->booking_code,
                'hotel_name' => $booking->roomType?->hotel?->name,
                'check_in' => $booking->check_in?->format('Y-m-d'),
                'check_out' => $booking->check_out?->format('Y-m-d'),
            ]
        );
    }

    public function notifyBookingCancelled(Booking $booking): NotificationRecord
    {
        return $this->create(
            $booking->user,
            $booking,
            'booking_cancelled',
            'database',
            [
                'booking_code' => $booking->booking_code,
                'hotel_name' => $booking->roomType?->hotel?->name,
            ]
        );
    }

    public function notifyCancellationRequested(Booking $booking): NotificationRecord
    {
        return $this->create(
            $booking->user,
            $booking,
            'cancellation_requested',
            'database',
            [
                'booking_code' => $booking->booking_code,
                'hotel_name' => $booking->roomType?->hotel?->name,
            ]
        );
    }

    public function notifyRefundApproved(Booking $booking, Refund $refund): NotificationRecord
    {
        return $this->create(
            $booking->user,
            $booking,
            'refund_approved',
            'database',
            [
                'booking_code' => $booking->booking_code,
                'refund_amount' => (float) $refund->amount,
            ]
        );
    }

    public function notifyRefundRejected(Booking $booking, Refund $refund): NotificationRecord
    {
        return $this->create(
            $booking->user,
            $booking,
            'refund_rejected',
            'database',
            [
                'booking_code' => $booking->booking_code,
                'reason' => $refund->admin_notes,
            ]
        );
    }
}
