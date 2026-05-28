<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\HotelImage;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

class HotelImageSeeder extends Seeder
{
    public function run(): void
    {
        $hotels = Hotel::all();
        foreach ($hotels as $hotel) {
            // Create 3-5 hotel-level images
            for ($i = 1; $i <= rand(3, 5); $i++) {
                HotelImage::create([
                    'hotel_id' => $hotel->id,
                    'image_path' => "hotels/{$hotel->slug}/exterior-{$i}.jpg",
                    'caption' => "Anh ngoai that {$i}",
                    'sort_order' => $i,
                ]);
            }
        }

        // Create room-type-level images
        $roomTypes = RoomType::all();
        foreach ($roomTypes as $roomType) {
            for ($i = 1; $i <= 2; $i++) {
                HotelImage::create([
                    'hotel_id' => $roomType->hotel_id,
                    'room_type_id' => $roomType->id,
                    'image_path' => "rooms/{$roomType->id}/room-{$i}.jpg",
                    'caption' => "Phong {$roomType->name} - Anh {$i}",
                    'sort_order' => $i,
                ]);
            }
        }
    }
}
