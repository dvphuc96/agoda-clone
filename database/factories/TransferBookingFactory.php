<?php

namespace Database\Factories;

use App\Models\Hotel;
use App\Models\TransferBooking;
use App\Models\TransferRoute;
use App\Models\TransferVehicleType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransferBookingFactory extends Factory
{
    protected $model = TransferBooking::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'booking_id' => null,
            'transfer_route_id' => TransferRoute::factory(),
            'transfer_vehicle_type_id' => TransferVehicleType::factory(),
            'hotel_id' => Hotel::factory(),
            'airport_code' => 'SGN',
            'airport_name' => 'Tan Son Nhat International Airport',
            'direction' => 'airport_to_hotel',
            'pickup_datetime' => now()->addDay(),
            'passengers' => fake()->numberBetween(1, 3),
            'contact_name' => fake()->name(),
            'contact_phone' => fake()->phoneNumber(),
            'flight_number' => fake()->optional()->bothify('VN###'),
            'special_requests' => null,
            'total_price' => fake()->numberBetween(250000, 900000),
            'currency' => 'VND',
            'status' => 'pending',
        ];
    }
}
