<?php

namespace Database\Factories;

use App\Models\Hotel;
use App\Models\TransferRoute;
use App\Models\TransferVehicleType;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransferRouteFactory extends Factory
{
    protected $model = TransferRoute::class;

    public function definition(): array
    {
        return [
            'hotel_id' => Hotel::factory(),
            'transfer_vehicle_type_id' => TransferVehicleType::factory(),
            'airport_code' => fake()->randomElement(['SGN', 'HAN', 'DAD']),
            'airport_name' => fake()->randomElement([
                'Tan Son Nhat International Airport',
                'Noi Bai International Airport',
                'Da Nang International Airport',
            ]),
            'pickup_latitude' => fake()->latitude(10, 22),
            'pickup_longitude' => fake()->longitude(105, 109),
            'direction' => fake()->randomElement(['airport_to_hotel', 'hotel_to_airport']),
            'price' => fake()->numberBetween(250000, 900000),
            'currency' => 'VND',
            'duration_minutes' => fake()->numberBetween(25, 75),
            'distance_meters' => fake()->numberBetween(8000, 45000),
            'duration_seconds' => fake()->numberBetween(1200, 5400),
            'base_fee' => 50000,
            'price_per_km' => fake()->randomElement([14000, 18000, 22000]),
            'price_override' => null,
            'pricing_source' => 'manual',
            'is_active' => true,
        ];
    }
}
