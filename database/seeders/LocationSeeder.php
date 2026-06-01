<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            ['name' => 'Hà Nội', 'slug' => 'ha-noi', 'region' => 'mien_bac', 'description' => 'Thủ đô ngàn năm văn hiến'],
            ['name' => 'Sapa', 'slug' => 'sapa', 'region' => 'mien_bac', 'description' => 'Thị trấn trong mây, ruộng bậc thang'],
            ['name' => 'Huế', 'slug' => 'hue', 'region' => 'mien_trung', 'description' => 'Cố đô thơ mộng, di sản văn hóa'],
            ['name' => 'Đà Nẵng', 'slug' => 'da-nang', 'region' => 'mien_trung', 'description' => 'Thành phố đáng sống nhất Việt Nam'],
            ['name' => 'Hội An', 'slug' => 'hoi-an', 'region' => 'mien_trung', 'description' => 'Phố cổ đèn lồng, di sản thế giới'],
            ['name' => 'Nha Trang', 'slug' => 'nha-trang', 'region' => 'mien_nam', 'description' => 'Vịnh biển tuyệt đẹp, đảo san hô'],
            ['name' => 'TP. Hồ Chí Minh', 'slug' => 'tp-hcm', 'region' => 'mien_nam', 'description' => 'Trung tâm kinh tế năng động'],
            ['name' => 'Phú Quốc', 'slug' => 'phu-quoc', 'region' => 'mien_nam', 'description' => 'Đảo ngọc, biển xanh cát trắng'],
        ];

        foreach ($locations as $loc) {
            Location::create($loc);
        }
    }
}
