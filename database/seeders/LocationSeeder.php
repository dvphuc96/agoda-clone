<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            ['name' => 'Ha Noi', 'slug' => 'ha-noi', 'region' => 'mien_bac', 'description' => 'Thu do ngan nam van hien'],
            ['name' => 'Sapa', 'slug' => 'sapa', 'region' => 'mien_bac', 'description' => 'Thi tran trong may, ruong bac thang'],
            ['name' => 'Hue', 'slug' => 'hue', 'region' => 'mien_trung', 'description' => 'Co do tho mong, di san van hoa'],
            ['name' => 'Da Nang', 'slug' => 'da-nang', 'region' => 'mien_trung', 'description' => 'Thanh pho dang song nhat Viet Nam'],
            ['name' => 'Hoi An', 'slug' => 'hoi-an', 'region' => 'mien_trung', 'description' => 'Pho co den long, di san the gioi'],
            ['name' => 'Nha Trang', 'slug' => 'nha-trang', 'region' => 'mien_nam', 'description' => 'Vinh bien tuyet dep, dao san ho'],
            ['name' => 'TP.HCM', 'slug' => 'tp-hcm', 'region' => 'mien_nam', 'description' => 'Trung tam kinh te, nang dong'],
            ['name' => 'Phu Quoc', 'slug' => 'phu-quoc', 'region' => 'mien_nam', 'description' => 'Dao ngoc, bien xanh cat trang'],
        ];

        foreach ($locations as $loc) {
            Location::create($loc);
        }
    }
}
