<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\HotelImage;
use App\Models\Location;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageUrlResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_hotel_image_resource_returns_absolute_storage_url_for_existing_files(): void
    {
        Storage::fake('public');

        $location = Location::factory()->create();
        $hotel = Hotel::factory()->create(['location_id' => $location->id]);
        Storage::disk('public')->put('hotels/uploaded.jpg', 'image-content');
        HotelImage::factory()->create([
            'hotel_id' => $hotel->id,
            'image_path' => 'hotels/uploaded.jpg',
        ]);

        $response = $this->getJson("/api/hotels/{$hotel->slug}");

        $response->assertOk();
        $imagePath = $response->json('images.0.image_path') ?? $response->json('data.images.0.image_path');

        $this->assertIsString($imagePath);
        $this->assertStringContainsString('/storage/hotels/uploaded.jpg', $imagePath);
    }

    public function test_hotel_image_resource_returns_fallback_url_for_missing_seed_files(): void
    {
        $location = Location::factory()->create();
        $hotel = Hotel::factory()->create(['location_id' => $location->id]);
        HotelImage::factory()->create([
            'hotel_id' => $hotel->id,
            'image_path' => 'hotels/missing-seed-file.jpg',
        ]);

        $response = $this->getJson("/api/hotels/{$hotel->slug}");

        $response->assertOk();
        $imagePath = $response->json('images.0.image_path') ?? $response->json('data.images.0.image_path');

        $this->assertIsString($imagePath);
        $this->assertStringStartsWith('https://images.unsplash.com/', $imagePath);
    }
}
