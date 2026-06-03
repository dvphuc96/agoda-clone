<?php

namespace Database\Factories;

use App\Models\Hotel;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'hotel_id' => Hotel::factory(),
            'booking_id' => null,
            'rating' => fake()->numberBetween(1, 5),
            'title' => fake()->optional()->sentence(4),
            'comment' => fake()->optional()->paragraph(),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
        ];
    }
}
