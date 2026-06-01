<?php

namespace Database\Factories;

use App\Models\Hotel;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoomTypeFactory extends Factory
{
    protected $model = RoomType::class;

    public function definition(): array
    {
        return [
            'hotel_id' => Hotel::factory(),
            'name' => fake()->randomElement(['Standard', 'Deluxe', 'Suite', 'Superior']) . ' Room',
            'description' => fake()->paragraph(),
            'max_guests' => fake()->numberBetween(1, 4),
            'bed_type' => fake()->randomElement(['single', 'double', 'twin', 'king']),
            'size_sqm' => fake()->numberBetween(20, 80),
            'price_per_night' => fake()->numberBetween(1000, 10000),
            'amenities' => ['wifi', 'ac', 'tv'],
            'total_rooms' => fake()->numberBetween(3, 20),
        ];
    }
}
