<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\RoomType;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $checkIn = fake()->dateTimeBetween('+1 day', '+30 days');
        $checkOut = (clone $checkIn)->modify('+' . fake()->numberBetween(1, 7) . ' days');

        return [
            'user_id' => User::factory(),
            'room_type_id' => RoomType::factory(),
            'check_in' => $checkIn->format('Y-m-d'),
            'check_out' => $checkOut->format('Y-m-d'),
            'guests' => fake()->numberBetween(1, 4),
            'special_requests' => fake()->optional()->sentence(),
            'total_price' => fake()->randomFloat(2, 100, 5000),
            'status' => fake()->randomElement(['pending', 'confirmed', 'cancelled', 'completed']),
        ];
    }
}
