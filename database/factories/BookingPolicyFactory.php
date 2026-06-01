<?php

namespace Database\Factories;

use App\Models\BookingPolicy;
use App\Models\Hotel;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingPolicyFactory extends Factory
{
    protected $model = BookingPolicy::class;

    public function definition(): array
    {
        return [
            'hotel_id' => Hotel::factory(),
            'room_type_id' => null,
            'name' => fake()->randomElement(['Chinh sach tieu chuan', 'Huy mien phi 24h', 'Khong hoan tien', 'Huy linh hoat']),
            'description' => fake()->optional()->sentence(),
            'free_cancellation_hours' => fake()->randomElement([12, 24, 48, 72]),
            'cancellation_fee_percent' => fake()->randomElement([0, 10, 20, 50, 100]),
            'is_non_refundable' => false,
            'is_active' => true,
        ];
    }
}
