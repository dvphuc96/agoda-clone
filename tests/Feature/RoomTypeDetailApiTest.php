<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Hotel;
use App\Models\HotelImage;
use App\Models\Location;
use App\Models\Payment;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomTypeDetailApiTest extends TestCase
{
    use RefreshDatabase;

    private RoomType $roomType;

    protected function setUp(): void
    {
        parent::setUp();

        $location = Location::factory()->create();
        $hotel = Hotel::factory()->create(['location_id' => $location->id]);
        $this->roomType = RoomType::factory()->create(['hotel_id' => $hotel->id]);
        HotelImage::factory()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $this->roomType->id,
            'image_path' => 'test.jpg',
        ]);
    }

    public function test_can_show_room_type_detail(): void
    {
        $response = $this->getJson("/api/room-types/{$this->roomType->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id', 'name', 'description', 'max_guests', 'bed_type',
                    'size_sqm', 'price_per_night', 'amenities', 'total_rooms',
                    'images', 'hotel',
                ],
            ])
            ->assertJsonPath('data.id', $this->roomType->id)
            ->assertJsonPath('data.name', $this->roomType->name);
    }

    public function test_room_type_includes_hotel_with_location(): void
    {
        $response = $this->getJson("/api/room-types/{$this->roomType->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'hotel' => [
                        'id', 'name', 'slug', 'location' => ['id', 'name', 'slug'],
                    ],
                ],
            ]);
    }

    public function test_room_type_includes_images(): void
    {
        $response = $this->getJson("/api/room-types/{$this->roomType->id}");

        $response->assertOk()
            ->assertJsonCount(1, 'data.images');
    }

    public function test_room_type_returns_available_rooms_with_dates(): void
    {
        $checkIn = now()->addDay()->format('Y-m-d');
        $checkOut = now()->addDays(3)->format('Y-m-d');

        $response = $this->getJson("/api/room-types/{$this->roomType->id}?check_in={$checkIn}&check_out={$checkOut}");

        $response->assertOk()
            ->assertJsonStructure(['data' => ['available_rooms']]);
    }

    public function test_room_type_without_dates_has_no_available_rooms(): void
    {
        $response = $this->getJson("/api/room-types/{$this->roomType->id}");

        $response->assertOk()
            ->assertJsonMissing(['data' => ['available_rooms']]);
    }

    public function test_room_type_not_found(): void
    {
        $response = $this->getJson('/api/room-types/999');

        $response->assertNotFound();
    }

    public function test_room_type_invalid_date_range(): void
    {
        $checkIn = now()->addDays(5)->format('Y-m-d');
        $checkOut = now()->addDay()->format('Y-m-d');

        $response = $this->getJson("/api/room-types/{$this->roomType->id}?check_in={$checkIn}&check_out={$checkOut}");

        $response->assertStatus(422);
    }
}
