<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\BookingModification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingModificationFactory extends Factory
{
    protected $model = BookingModification::class;

    public function definition(): array
    {
        $oldCheckIn = fake()->dateTimeBetween('+1 day', '+15 days');
        $oldCheckOut = (clone $oldCheckIn)->modify('+' . fake()->numberBetween(1, 5) . ' days');

        $newCheckIn = fake()->dateTimeBetween('+1 day', '+15 days');
        $newCheckOut = (clone $newCheckIn)->modify('+' . fake()->numberBetween(1, 5) . ' days');

        $oldPrice = fake()->randomFloat(2, 500, 5000);
        $newPrice = fake()->randomFloat(2, 500, 5000);

        return [
            'booking_id' => Booking::factory(),
            'user_id' => User::factory(),
            'old_check_in' => $oldCheckIn->format('Y-m-d'),
            'old_check_out' => $oldCheckOut->format('Y-m-d'),
            'old_guests' => fake()->numberBetween(1, 4),
            'old_total_price' => $oldPrice,
            'new_check_in' => $newCheckIn->format('Y-m-d'),
            'new_check_out' => $newCheckOut->format('Y-m-d'),
            'new_guests' => fake()->numberBetween(1, 4),
            'new_total_price' => $newPrice,
            'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
            'admin_notes' => fake()->optional()->sentence(),
        ];
    }
}
