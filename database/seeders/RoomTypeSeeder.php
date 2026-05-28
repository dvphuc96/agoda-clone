<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomTypeSeeder extends Seeder
{
    public function run(): void
    {
        $hotels = Hotel::all();
        $roomTemplates = [
            ['name' => 'Superior', 'bed_type' => 'double', 'size_sqm' => 28, 'price_base' => 800000, 'amenities' => ['wifi','tv','minibar'], 'total_rooms' => 15],
            ['name' => 'Deluxe', 'bed_type' => 'king', 'size_sqm' => 35, 'price_base' => 1500000, 'amenities' => ['wifi','tv','minibar','bathtub','city_view'], 'total_rooms' => 10],
            ['name' => 'Suite', 'bed_type' => 'king', 'size_sqm' => 55, 'price_base' => 3000000, 'amenities' => ['wifi','tv','minibar','bathtub','living_room','city_view'], 'total_rooms' => 5],
            ['name' => 'Executive Suite', 'bed_type' => 'king', 'size_sqm' => 70, 'price_base' => 5000000, 'amenities' => ['wifi','tv','minibar','bathtub','living_room','kitchenette','sea_view'], 'total_rooms' => 3],
            ['name' => 'Standard', 'bed_type' => 'twin', 'size_sqm' => 24, 'price_base' => 500000, 'amenities' => ['wifi','tv'], 'total_rooms' => 20],
            ['name' => 'Family Room', 'bed_type' => 'king', 'size_sqm' => 45, 'price_base' => 2200000, 'amenities' => ['wifi','tv','minibar','extra_bed'], 'total_rooms' => 8],
        ];

        foreach ($hotels as $hotel) {
            $starMultiplier = $hotel->star_rating * 0.5;
            $numRooms = rand(2, 4);
            $selectedRooms = array_rand($roomTemplates, $numRooms);
            if (!is_array($selectedRooms)) $selectedRooms = [$selectedRooms];

            foreach ($selectedRooms as $idx) {
                $template = $roomTemplates[$idx];
                RoomType::create([
                    'hotel_id' => $hotel->id,
                    'name' => $template['name'],
                    'description' => "Phong {$template['name']} tai {$hotel->name}, dien tich {$template['size_sqm']}m2",
                    'max_guests' => $template['bed_type'] === 'king' ? 3 : 2,
                    'bed_type' => $template['bed_type'],
                    'size_sqm' => $template['size_sqm'],
                    'price_per_night' => round($template['price_base'] * $starMultiplier),
                    'amenities' => $template['amenities'],
                    'total_rooms' => $template['total_rooms'],
                ]);
            }
        }
    }
}
