<?php

namespace Database\Factories;

use App\Models\Hotel;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

class HotelFactory extends Factory
{
    protected $model = Hotel::class;

    public function definition(): array
    {
        return [
            'location_id' => Location::factory(),
            'name' => fake()->company() . ' Hotel',
            'slug' => fake()->unique()->slug(),
            'description' => fake()->paragraph(),
            'address' => fake()->address(),
            'star_rating' => fake()->numberBetween(1, 5),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'checkin_time' => '14:00',
            'checkout_time' => '12:00',
            'amenities' => ['wifi', 'pool', 'parking'],
            'status' => 'active',
        ];
    }
}
