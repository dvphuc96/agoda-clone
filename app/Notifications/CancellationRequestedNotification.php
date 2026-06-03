<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CancellationRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $hotelName = $this->booking->roomType?->hotel?->name ?? 'N/A';

        return (new MailMessage)
            ->subject('Cancellation Request Received - ' . $this->booking->booking_code)
            ->markdown('emails.cancellation-requested', [
                'booking' => $this->booking,
                'hotelName' => $hotelName,
                'userName' => $notifiable->name,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'booking_code' => $this->booking->booking_code,
            'hotel_name' => $this->booking->roomType?->hotel?->name,
        ];
    }
}
