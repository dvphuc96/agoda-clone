<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Hotel;
use App\Models\Location;
use App\Models\Payment;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFiltersTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Hotel $hotel;
    private RoomType $roomType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $location = Location::factory()->create();
        $this->hotel = Hotel::factory()->create(['location_id' => $location->id]);
        $this->roomType = RoomType::factory()->create([
            'hotel_id' => $this->hotel->id,
            'price_per_night' => 100,
            'amenities' => ['wifi', 'ac', 'breakfast'],
            'bed_type' => 'king',
        ]);
    }

    // --- Admin Booking Filters ---

    public function test_admin_can_filter_bookings_by_status(): void
    {
        Booking::factory()->create(['room_type_id' => $this->roomType->id, 'status' => 'confirmed']);
        Booking::factory()->create(['room_type_id' => $this->roomType->id, 'status' => 'pending']);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/bookings?status=confirmed');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_filter_bookings_by_room_type_id(): void
    {
        $otherRoomType = RoomType::factory()->create(['hotel_id' => $this->hotel->id]);
        Booking::factory()->create(['room_type_id' => $this->roomType->id]);
        Booking::factory()->create(['room_type_id' => $otherRoomType->id]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/bookings?room_type_id={$this->roomType->id}");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.room_type.id', $this->roomType->id);
    }

    public function test_admin_can_filter_bookings_by_user_id(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        Booking::factory()->create(['user_id' => $user1->id, 'room_type_id' => $this->roomType->id]);
        Booking::factory()->create(['user_id' => $user2->id, 'room_type_id' => $this->roomType->id]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/bookings?user_id={$user1->id}");

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_search_bookings_by_code(): void
    {
        $booking = Booking::factory()->create(['room_type_id' => $this->roomType->id]);
        // booking_code is auto-generated in model booted()

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/bookings?search=' . $booking->booking_code);

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_filter_bookings_by_hotel(): void
    {
        $otherHotel = Hotel::factory()->create(['location_id' => $this->hotel->location_id]);
        $otherRoomType = RoomType::factory()->create(['hotel_id' => $otherHotel->id]);
        Booking::factory()->create(['room_type_id' => $this->roomType->id]);
        Booking::factory()->create(['room_type_id' => $otherRoomType->id]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/bookings?hotel_id={$this->hotel->id}");

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    // --- Admin Hotel Filters ---

    public function test_admin_can_filter_hotels_by_min_price(): void
    {
        $cheapRoom = RoomType::factory()->create(['hotel_id' => $this->hotel->id, 'price_per_night' => 50]);
        $expensiveHotel = Hotel::factory()->create(['location_id' => $this->hotel->location_id]);
        RoomType::factory()->create(['hotel_id' => $expensiveHotel->id, 'price_per_night' => 300]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/hotels?min_price=200');

        $response->assertOk();
        $hotelIds = collect($response->json('data'))->pluck('id');
        $this->assertContains($expensiveHotel->id, $hotelIds);
    }

    public function test_admin_can_filter_hotels_by_max_price(): void
    {
        $expensiveHotel = Hotel::factory()->create(['location_id' => $this->hotel->location_id]);
        RoomType::factory()->create(['hotel_id' => $expensiveHotel->id, 'price_per_night' => 500]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/hotels?max_price=150');

        $response->assertOk();
        $hotelIds = collect($response->json('data'))->pluck('id');
        $this->assertContains($this->hotel->id, $hotelIds);
    }

    public function test_admin_can_filter_hotels_by_location(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/hotels?location_id={$this->hotel->location_id}");

        $response->assertOk();
        collect($response->json('data'))->each(function ($hotel) {
            $this->assertEquals($this->hotel->location_id, $hotel['location']['id']);
        });
    }

    public function test_admin_can_search_hotels_by_name(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/hotels?search=' . urlencode($this->hotel->name));

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    // --- Admin Payment Filters ---

    public function test_admin_can_filter_payments_by_method(): void
    {
        $booking = Booking::factory()->create(['room_type_id' => $this->roomType->id]);
        Payment::factory()->create(['booking_id' => $booking->id, 'payment_method' => 'vnpay']);
        Payment::factory()->create(['booking_id' => $booking->id, 'payment_method' => 'momo']);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/payments?payment_method=vnpay');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_search_payments_by_booking_code(): void
    {
        $booking = Booking::factory()->create(['room_type_id' => $this->roomType->id]);
        Payment::factory()->create(['booking_id' => $booking->id]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/payments?search=' . $booking->booking_code);

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_filter_payments_by_date_range(): void
    {
        $booking = Booking::factory()->create(['room_type_id' => $this->roomType->id]);
        Payment::factory()->create(['booking_id' => $booking->id]);

        $today = now()->format('Y-m-d');
        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/payments?date_from={$today}&date_to={$today}");

        $response->assertOk();
    }

    // --- Admin RoomType Filters ---

    public function test_admin_can_filter_room_types_by_price_range(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/hotels/{$this->hotel->id}/room-types?min_price=50&max_price=150");

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_filter_room_types_by_amenity(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/hotels/{$this->hotel->id}/room-types?amenity=wifi");

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_filter_room_types_by_bed_type(): void
    {
        RoomType::factory()->create(['hotel_id' => $this->hotel->id, 'bed_type' => 'single']);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/hotels/{$this->hotel->id}/room-types?bed_type=king");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.bed_type', 'king');
    }

    // --- Non-admin cannot access ---

    public function test_non_admin_cannot_access_admin_bookings(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)
            ->getJson('/api/admin/bookings');

        $response->assertForbidden();
    }
}
