<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\TransferRoute;
use App\Models\TransferVehicleType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TransferSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = collect([
            ['name' => 'Private Sedan', 'description' => 'Comfortable private car for couples or solo travelers.', 'passenger_capacity' => 3, 'luggage_capacity' => 2],
            ['name' => 'Family SUV', 'description' => 'Roomier option for families with extra luggage.', 'passenger_capacity' => 5, 'luggage_capacity' => 4],
            ['name' => 'Executive Van', 'description' => 'Spacious van for groups and premium airport pickups.', 'passenger_capacity' => 8, 'luggage_capacity' => 8],
        ])->mapWithKeys(function (array $vehicle) {
            $vehicle['slug'] = Str::slug($vehicle['name']);
            $vehicle['is_active'] = true;

            return [$vehicle['name'] => TransferVehicleType::updateOrCreate(['slug' => $vehicle['slug']], $vehicle)];
        });

        $airportByLocation = [
            1 => ['HAN', 'Noi Bai International Airport', 21.2142, 105.8028, 28000, 45],
            4 => ['DAD', 'Da Nang International Airport', 16.0439, 108.1994, 7000, 25],
            7 => ['SGN', 'Tan Son Nhat International Airport', 10.8188, 106.6519, 8000, 35],
            8 => ['PQC', 'Phu Quoc International Airport', 10.1698, 103.9931, 12000, 30],
        ];

        $hotelCoordinatesByLocation = [
            1 => [21.0245, 105.8575],
            4 => [16.0544, 108.2022],
            7 => [10.7769, 106.7009],
            8 => [10.2217, 103.9592],
        ];

        Hotel::query()
            ->whereIn('location_id', array_keys($airportByLocation))
            ->get()
            ->each(function (Hotel $hotel) use ($airportByLocation, $hotelCoordinatesByLocation, $vehicles) {
                [$code, $name, $pickupLat, $pickupLng, $distanceMeters, $duration] = $airportByLocation[$hotel->location_id];
                [$hotelLat, $hotelLng] = $hotelCoordinatesByLocation[$hotel->location_id];
                if (! $hotel->latitude || ! $hotel->longitude) {
                    $hotel->update(['latitude' => $hotelLat, 'longitude' => $hotelLng]);
                }

                foreach ($vehicles->values() as $index => $vehicle) {
                    $pricePerKm = match ($index) {
                        1 => 18000,
                        2 => 22000,
                        default => 14000,
                    };
                    $price = ceil((50000 + (($distanceMeters / 1000) * $pricePerKm)) / 1000) * 1000;

                    foreach (['airport_to_hotel', 'hotel_to_airport'] as $direction) {
                        TransferRoute::updateOrCreate(
                            [
                                'hotel_id' => $hotel->id,
                                'transfer_vehicle_type_id' => $vehicle->id,
                                'airport_code' => $code,
                                'direction' => $direction,
                            ],
                            [
                                'airport_name' => $name,
                                'pickup_latitude' => $pickupLat,
                                'pickup_longitude' => $pickupLng,
                                'price' => $price,
                                'currency' => 'VND',
                                'duration_minutes' => $duration,
                                'distance_meters' => $distanceMeters,
                                'duration_seconds' => $duration * 60,
                                'base_fee' => 50000,
                                'price_per_km' => $pricePerKm,
                                'price_override' => null,
                                'pricing_source' => 'map',
                                'is_active' => true,
                            ],
                        );
                    }
                }
            });
    }
}
