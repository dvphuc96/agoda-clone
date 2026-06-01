<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RefundFactory extends Factory
{
    protected $model = Refund::class;

    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'payment_id' => null,
            'amount' => fake()->randomFloat(2, 50, 2000),
            'reason' => fake()->optional()->sentence(),
            'status' => 'pending',
            'requested_by' => User::factory(),
            'processed_by' => null,
            'processed_at' => null,
            'admin_notes' => null,
        ];
    }
}
