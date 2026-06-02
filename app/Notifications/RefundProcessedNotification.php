<?php

namespace App\Notifications;

use App\Models\Refund;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RefundProcessedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Refund $refund) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $booking = $this->refund->booking;
        $hotelName = $booking->roomType?->hotel?->name ?? 'N/A';

        return (new MailMessage)
            ->subject('Refund Processed - ' . $booking->booking_code)
            ->markdown('emails.refund-processed', [
                'refund' => $this->refund,
                'booking' => $booking,
                'hotelName' => $hotelName,
                'userName' => $notifiable->name,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'booking_code' => $this->refund->booking->booking_code,
            'refund_amount' => (float) $this->refund->amount,
        ];
    }
}
