<?php

namespace Database\Factories;

use App\Models\TransferVehicleType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TransferVehicleTypeFactory extends Factory
{
    protected $model = TransferVehicleType::class;

    public function definition(): array
    {
        $name = fake()->randomElement(['Private Sedan', 'Family SUV', 'Executive Van']) . ' ' . fake()->unique()->numberBetween(1, 999);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'passenger_capacity' => fake()->numberBetween(2, 7),
            'luggage_capacity' => fake()->numberBetween(1, 5),
            'image' => null,
            'is_active' => true,
        ];
    }
}
