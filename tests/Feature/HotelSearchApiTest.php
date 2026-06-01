<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\HotelImage;
use App\Models\Location;
use App\Models\RoomType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotelSearchApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_price_filter_returns_display_prices_from_matching_room_types(): void
    {
        $location = Location::factory()->create();
        $hotel = Hotel::factory()->create([
            'location_id' => $location->id,
            'name' => 'Mixed Price Hotel',
        ]);

        RoomType::factory()->create([
            'hotel_id' => $hotel->id,
            'price_per_night' => 2000,
        ]);
        RoomType::factory()->create([
            'hotel_id' => $hotel->id,
            'price_per_night' => 9000,
        ]);

        $response = $this->getJson('/api/hotels?price_min=1000&price_max=3000');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $hotel->id)
            ->assertJsonPath('data.0.min_price', '2000.00')
            ->assertJsonPath('data.0.max_price', '2000.00');
    }

    public function test_featured_hotels_include_display_prices_and_resolved_images(): void
    {
        $location = Location::factory()->create();
        $hotel = Hotel::factory()->create([
            'location_id' => $location->id,
            'name' => 'Featured Price Hotel',
        ]);
        RoomType::factory()->create([
            'hotel_id' => $hotel->id,
            'price_per_night' => 2500,
        ]);
        HotelImage::factory()->create([
            'hotel_id' => $hotel->id,
            'image_path' => 'hotels/missing-featured-image.jpg',
        ]);

        $response = $this->getJson('/api/hotels/featured');

        $response->assertOk()
            ->assertJsonPath('data.0.id', $hotel->id)
            ->assertJsonPath('data.0.min_price', '2500.00')
            ->assertJsonPath('data.0.max_price', '2500.00');

        $imagePath = $response->json('data.0.images.0.image_path');
        $this->assertIsString($imagePath);
        $this->assertStringStartsWith('https://images.unsplash.com/', $imagePath);
    }
}
