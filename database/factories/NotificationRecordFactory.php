<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\NotificationRecord;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationRecordFactory extends Factory
{
    protected $model = NotificationRecord::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'booking_id' => null,
            'type' => fake()->randomElement([
                'booking_confirmed',
                'booking_cancelled',
                'cancellation_requested',
                'refund_approved',
                'refund_rejected',
            ]),
            'channel' => 'database',
            'status' => 'sent',
            'payload' => null,
            'sent_at' => now(),
        ];
    }
}
