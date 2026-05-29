<?php

namespace Database\Factories;

use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

class LocationFactory extends Factory
{
    protected $model = Location::class;

    public function definition(): array
    {
        return [
            'name' => fake()->city(),
            'slug' => fake()->unique()->slug(),
            'image' => fake()->imageUrl(640, 480, 'travel'),
            'description' => fake()->paragraph(),
            'region' => fake()->randomElement(['mien_bac', 'mien_trung', 'mien_nam']),
        ];
    }
}
