<?php

namespace Database\Seeders;

use App\Models\Hotel;
use Illuminate\Database\Seeder;

class HotelSeeder extends Seeder
{
    public function run(): void
    {
        $hotels = [
            // Ha Noi (3)
            ['location_id' => 1, 'name' => 'Sofitel Legend Metropole Ha Noi', 'address' => '15 Ngo Quyen, Hoan Kiem', 'star_rating' => 5, 'phone' => '024-3826-6919', 'email' => 'info@sofitel-hanoi.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 1, 'name' => 'Hanoi La Siesta Hotel & Spa', 'address' => '94 Ma May, Hoan Kiem', 'star_rating' => 4, 'phone' => '024-3266-8866', 'email' => 'info@lasiesta-hanoi.com', 'amenities' => ['wifi','spa','restaurant'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 1, 'name' => 'Hotel du Parc Hanoi', 'address' => '84 Ba Trieu, Hoan Kiem', 'star_rating' => 3, 'phone' => '024-3943-8888', 'email' => 'info@duparc-hanoi.com', 'amenities' => ['wifi','restaurant','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // Sapa (2)
            ['location_id' => 2, 'name' => 'Hotel de la Coupole - MGallery', 'address' => 'Hoang Lien, Sapa', 'star_rating' => 5, 'phone' => '020-3868-8888', 'email' => 'info@delacoupole-sapa.com', 'amenities' => ['wifi','pool','spa','restaurant','gym'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 2, 'name' => 'Sapa Jade Hill Resort', 'address' => 'Muong Hoa, Sapa', 'star_rating' => 4, 'phone' => '020-3878-8888', 'email' => 'info@jadehill-sapa.com', 'amenities' => ['wifi','restaurant','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // Hue (3)
            ['location_id' => 3, 'name' => 'Azerai La Residence Hue', 'address' => '5 Le Loi, Hue', 'star_rating' => 5, 'phone' => '023-4383-7474', 'email' => 'info@azerai-hue.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 3, 'name' => 'Imperial Hotel Hue', 'address' => '8 Hung Vuong, Hue', 'star_rating' => 4, 'phone' => '023-4382-5555', 'email' => 'info@imperial-hue.com', 'amenities' => ['wifi','pool','restaurant','gym'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 3, 'name' => 'Vedana Lagoon Resort & Spa', 'address' => 'Laguna Lang Co, Hue', 'star_rating' => 5, 'phone' => '023-4369-8888', 'email' => 'info@vedana-hue.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // Da Nang (4)
            ['location_id' => 4, 'name' => 'InterContinental Danang Sun Peninsula', 'address' => 'Ban dao Son Tra, Da Nang', 'star_rating' => 5, 'phone' => '023-6396-8888', 'email' => 'info@intercontinental-danang.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 4, 'name' => 'Fusion Maia Da Nang', 'address' => 'Truong Sa, Ngu Hanh Son, Da Nang', 'star_rating' => 5, 'phone' => '023-6395-5555', 'email' => 'info@fusionmaia-danang.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 4, 'name' => 'Silver Sea Hotel Da Nang', 'address' => '34 Vo Van Tan, Da Nang', 'star_rating' => 4, 'phone' => '023-6399-8888', 'email' => 'info@silversea-danang.com', 'amenities' => ['wifi','restaurant','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 4, 'name' => 'A La Carte Da Nang Beach Hotel', 'address' => '220 Vo Nguyen Giap, Da Nang', 'star_rating' => 4, 'phone' => '023-6392-8888', 'email' => 'info@alacarte-danang.com', 'amenities' => ['wifi','pool','restaurant','gym','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // Hoi An (3)
            ['location_id' => 5, 'name' => 'Four Seasons Resort Hoi An', 'address' => 'Cua Dai, Hoi An', 'star_rating' => 5, 'phone' => '023-5395-8888', 'email' => 'info@fourseasons-hoian.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 5, 'name' => 'Almanity Hoi An Wellness Resort', 'address' => '88 Cua Dai, Hoi An', 'star_rating' => 4, 'phone' => '023-5392-8888', 'email' => 'info@almanity-hoian.com', 'amenities' => ['wifi','pool','spa','restaurant'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 5, 'name' => 'Little Hoi An Boutique Hotel', 'address' => '46 Nguyen Duy Hieu, Hoi An', 'star_rating' => 3, 'phone' => '023-5391-8888', 'email' => 'info@littlehoian.com', 'amenities' => ['wifi','restaurant'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // Nha Trang (3)
            ['location_id' => 6, 'name' => 'Sheraton Resort Nha Trang', 'address' => '28 Tran Phu, Nha Trang', 'star_rating' => 5, 'phone' => '025-8388-8888', 'email' => 'info@sheraton-nhatrang.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 6, 'name' => 'Vinpearl Resort Nha Trang', 'address' => 'Dao Hon Tre, Nha Trang', 'star_rating' => 5, 'phone' => '025-8388-9999', 'email' => 'info@vinpearl-nhatrang.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 6, 'name' => 'Liberty Central Nha Trang', 'address' => '60 Tran Phu, Nha Trang', 'star_rating' => 4, 'phone' => '025-8388-7777', 'email' => 'info@liberty-nhatrang.com', 'amenities' => ['wifi','pool','restaurant','gym'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // TP.HCM (3)
            ['location_id' => 7, 'name' => 'Park Hyatt Sai Gon', 'address' => '2 Cong xa Paris, Quan 1', 'star_rating' => 5, 'phone' => '028-3824-1234', 'email' => 'info@parkhyatt-saigon.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 7, 'name' => 'Hotel Nikko Sai Gon', 'address' => '235 Nguyen Van Cu, Quan 1', 'star_rating' => 4, 'phone' => '028-3822-5555', 'email' => 'info@nikko-saigon.com', 'amenities' => ['wifi','pool','restaurant','gym','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 7, 'name' => 'Liberty Central Saigon Citypoint', 'address' => '59 Pasteur, Quan 1', 'star_rating' => 4, 'phone' => '028-3822-8888', 'email' => 'info@liberty-saigon.com', 'amenities' => ['wifi','restaurant','gym'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // Phu Quoc (4)
            ['location_id' => 8, 'name' => 'InterContinental Phu Quoc Long Beach', 'address' => 'Bai Truong, Phu Quoc', 'star_rating' => 5, 'phone' => '029-7386-8888', 'email' => 'info@intercontinental-phuquoc.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 8, 'name' => 'JW Marriott Phu Quoc', 'address' => 'Khmer, Phu Quoc', 'star_rating' => 5, 'phone' => '029-7386-9999', 'email' => 'info@jwmarriott-phuquoc.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 8, 'name' => 'Mango Bay Resort Phu Quoc', 'address' => 'Ong Lang, Phu Quoc', 'star_rating' => 3, 'phone' => '029-7384-8888', 'email' => 'info@mangobay-phuquoc.com', 'amenities' => ['wifi','restaurant','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['location_id' => 8, 'name' => 'Novotel Phu Quoc Resort', 'address' => 'Duong Dong, Phu Quoc', 'star_rating' => 4, 'phone' => '029-7384-9999', 'email' => 'info@novotel-phuquoc.com', 'amenities' => ['wifi','pool','restaurant','gym','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
        ];

        foreach ($hotels as $hotel) {
            Hotel::create($hotel);
        }
    }
}
