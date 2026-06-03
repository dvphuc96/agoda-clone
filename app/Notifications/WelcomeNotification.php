<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct() {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to GoStay!')
            ->markdown('emails.welcome', [
                'userName' => $notifiable->name,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Welcome to GoStay! Start exploring amazing hotels and destinations.',
        ];
    }
}
