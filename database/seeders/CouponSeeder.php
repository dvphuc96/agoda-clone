<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME10',
                'description' => 'Giảm 10% cho lần đặt đầu tiên',
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'min_booking_value' => 500000,
                'max_uses' => 100,
                'max_uses_per_user' => 1,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(3),
                'is_active' => true,
            ],
            [
                'code' => 'SUMMER20',
                'description' => 'Khuyến mãi mùa hè giảm 20%',
                'discount_type' => 'percentage',
                'discount_value' => 20,
                'min_booking_value' => 1000000,
                'max_uses' => 50,
                'max_uses_per_user' => 2,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(2),
                'is_active' => true,
            ],
            [
                'code' => 'SAVE500K',
                'description' => 'Giảm trực tiếp 500.000 VNĐ',
                'discount_type' => 'fixed_amount',
                'discount_value' => 500000,
                'min_booking_value' => 2000000,
                'max_uses' => 200,
                'max_uses_per_user' => 3,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(6),
                'is_active' => true,
            ],
            [
                'code' => 'EXPIRED10',
                'description' => 'Coupon đã hết hạn (test)',
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'min_booking_value' => 100000,
                'max_uses' => 100,
                'max_uses_per_user' => 1,
                'starts_at' => now()->subMonths(2),
                'expires_at' => now()->subMonth(),
                'is_active' => true,
            ],
            [
                'code' => 'INACTIVE15',
                'description' => 'Coupon đã bị vô hiệu hóa (test)',
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'min_booking_value' => 300000,
                'max_uses' => 50,
                'max_uses_per_user' => 1,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(3),
                'is_active' => false,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::create($coupon);
        }

        $this->command->info('Coupon seeding completed successfully!');
    }
}