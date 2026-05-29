<?php

namespace Database\Factories;

use App\Models\Hotel;
use App\Models\HotelImage;
use Illuminate\Database\Eloquent\Factories\Factory;

class HotelImageFactory extends Factory
{
    protected $model = HotelImage::class;

    public function definition(): array
    {
        return [
            'hotel_id' => Hotel::factory(),
            'room_type_id' => null,
            'image_path' => 'hotels/' . fake()->uuid() . '.jpg',
            'caption' => fake()->optional()->sentence(),
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }
}
