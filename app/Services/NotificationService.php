<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\NotificationRecord;
use App\Models\Refund;
use App\Models\User;
use App\Notifications\BookingCancelledNotification;
use App\Notifications\BookingConfirmedNotification;
use App\Notifications\CancellationRequestedNotification;
use App\Notifications\RefundProcessedNotification;

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
        $record = $this->create(
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

        $booking->user->notify(new BookingConfirmedNotification($booking));
        $record->update(['email_sent_at' => now()]);

        return $record;
    }

    public function notifyBookingCancelled(Booking $booking): NotificationRecord
    {
        $record = $this->create(
            $booking->user,
            $booking,
            'booking_cancelled',
            'database',
            [
                'booking_code' => $booking->booking_code,
                'hotel_name' => $booking->roomType?->hotel?->name,
            ]
        );

        $booking->user->notify(new BookingCancelledNotification($booking));
        $record->update(['email_sent_at' => now()]);

        return $record;
    }

    public function notifyCancellationRequested(Booking $booking): NotificationRecord
    {
        $record = $this->create(
            $booking->user,
            $booking,
            'cancellation_requested',
            'database',
            [
                'booking_code' => $booking->booking_code,
                'hotel_name' => $booking->roomType?->hotel?->name,
            ]
        );

        $booking->user->notify(new CancellationRequestedNotification($booking));
        $record->update(['email_sent_at' => now()]);

        return $record;
    }

    public function notifyRefundApproved(Booking $booking, Refund $refund): NotificationRecord
    {
        $record = $this->create(
            $booking->user,
            $booking,
            'refund_approved',
            'database',
            [
                'booking_code' => $booking->booking_code,
                'refund_amount' => (float) $refund->amount,
            ]
        );

        $booking->user->notify(new RefundProcessedNotification($refund));
        $record->update(['email_sent_at' => now()]);

        return $record;
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
