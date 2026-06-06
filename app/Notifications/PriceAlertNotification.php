<?php

namespace App\Notifications;

use App\Models\PriceAlert;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PriceAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public PriceAlert $alert,
        public float $currentPrice,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('GoStay - Giá phòng đã giảm!')
            ->markdown('emails.price-alert', [
                'alert' => $this->alert,
                'currentPrice' => $this->currentPrice,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'hotel_name' => $this->alert->hotel->name,
            'hotel_slug' => $this->alert->hotel->slug,
            'target_price' => (float) $this->alert->target_price,
            'current_price' => $this->currentPrice,
        ];
    }
}
