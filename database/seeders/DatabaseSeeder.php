<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            LocationSeeder::class,
            HotelSeeder::class,
            RoomTypeSeeder::class,
            HotelImageSeeder::class,
            TransferSeeder::class,
            AdminUserSeeder::class,
            CouponSeeder::class,
            CurrencySeeder::class,
            DemoDataSeeder::class,
        ]);
    }
}
