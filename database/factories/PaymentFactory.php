<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'payment_method' => fake()->randomElement(['vnpay', 'momo']),
            'transaction_id' => fake()->uuid(),
            'amount' => fake()->randomFloat(2, 100, 5000),
            'currency' => 'VND',
            'status' => fake()->randomElement(['pending', 'success', 'failed']),
            'paid_at' => fake()->optional()->dateTime(),
            'gateway_response' => null,
        ];
    }
}
