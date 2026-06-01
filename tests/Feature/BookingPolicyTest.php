<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingPolicy;
use App\Models\Hotel;
use App\Models\Location;
use App\Models\NotificationRecord;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingPolicyTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $user;
    private RoomType $roomType;
    private Hotel $hotel;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->user = User::factory()->create(['role' => 'user']);
        $location = Location::factory()->create();
        $this->hotel = Hotel::factory()->create(['location_id' => $location->id]);
        $this->roomType = RoomType::factory()->create(['hotel_id' => $this->hotel->id]);
    }

    // --- Admin CRUD ---

    public function test_admin_can_list_policies(): void
    {
        BookingPolicy::factory()->count(3)->create(['hotel_id' => $this->hotel->id]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/booking-policies');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_create_policy(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/booking-policies', [
                'name' => 'Chinh sach huy 24h',
                'hotel_id' => $this->hotel->id,
                'free_cancellation_hours' => 24,
                'cancellation_fee_percent' => 10,
                'is_non_refundable' => false,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Chinh sach huy 24h')
            ->assertJsonPath('data.free_cancellation_hours', 24);

        $this->assertDatabaseHas('booking_policies', [
            'hotel_id' => $this->hotel->id,
            'name' => 'Chinh sach huy 24h',
        ]);
    }

    public function test_admin_can_create_policy_for_room_type(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/booking-policies', [
                'name' => 'Room-specific policy',
                'hotel_id' => $this->hotel->id,
                'room_type_id' => $this->roomType->id,
                'free_cancellation_hours' => 48,
                'cancellation_fee_percent' => 20,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.room_type_id', $this->roomType->id);
    }

    public function test_admin_cannot_create_policy_for_room_type_from_another_hotel(): void
    {
        $otherLocation = Location::factory()->create();
        $otherHotel = Hotel::factory()->create(['location_id' => $otherLocation->id]);
        $otherRoomType = RoomType::factory()->create(['hotel_id' => $otherHotel->id]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/booking-policies', [
                'name' => 'Mismatched policy',
                'hotel_id' => $this->hotel->id,
                'room_type_id' => $otherRoomType->id,
                'free_cancellation_hours' => 24,
                'cancellation_fee_percent' => 10,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('room_type_id');
    }

    public function test_admin_cannot_update_policy_to_room_type_from_another_hotel(): void
    {
        $otherLocation = Location::factory()->create();
        $otherHotel = Hotel::factory()->create(['location_id' => $otherLocation->id]);
        $otherRoomType = RoomType::factory()->create(['hotel_id' => $otherHotel->id]);
        $policy = BookingPolicy::factory()->create(['hotel_id' => $this->hotel->id]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/booking-policies/{$policy->id}", [
                'room_type_id' => $otherRoomType->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('room_type_id');
    }

    public function test_admin_can_show_policy(): void
    {
        $policy = BookingPolicy::factory()->create(['hotel_id' => $this->hotel->id]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/booking-policies/{$policy->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $policy->id);
    }

    public function test_admin_can_update_policy(): void
    {
        $policy = BookingPolicy::factory()->create(['hotel_id' => $this->hotel->id]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/booking-policies/{$policy->id}", [
                'name' => 'Updated policy',
                'free_cancellation_hours' => 72,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated policy')
            ->assertJsonPath('data.free_cancellation_hours', 72);
    }

    public function test_admin_can_delete_policy(): void
    {
        $policy = BookingPolicy::factory()->create(['hotel_id' => $this->hotel->id]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/booking-policies/{$policy->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('booking_policies', ['id' => $policy->id]);
    }

    public function test_admin_can_filter_policies_by_hotel(): void
    {
        $location2 = Location::factory()->create();
        $hotel2 = Hotel::factory()->create(['location_id' => $location2->id]);
        BookingPolicy::factory()->create(['hotel_id' => $this->hotel->id]);
        BookingPolicy::factory()->create(['hotel_id' => $hotel2->id]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/booking-policies?hotel_id={$this->hotel->id}");

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_non_admin_cannot_access_policies(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/admin/booking-policies');

        $response->assertForbidden();
    }

    public function test_validation_requires_name(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/booking-policies', [
                'hotel_id' => $this->hotel->id,
                'free_cancellation_hours' => 24,
                'cancellation_fee_percent' => 10,
            ]);

        $response->assertStatus(422);
    }

    // --- Cancellation eligibility ---

    public function test_booking_without_policy_allows_free_cancellation(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
            'status' => 'confirmed',
            'check_in' => now()->addDays(7),
            'check_out' => now()->addDays(9),
            'total_price' => 1000,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/bookings/{$booking->booking_code}");

        $response->assertOk();
        $data = $response->json('data.cancellation');
        $this->assertTrue($data['can_cancel']);
        $this->assertTrue($data['is_free']);
        $this->assertEquals(1000.0, $data['refund_amount']);
    }

    public function test_non_refundable_policy_shows_no_refund(): void
    {
        BookingPolicy::factory()->create([
            'hotel_id' => $this->hotel->id,
            'is_non_refundable' => true,
            'free_cancellation_hours' => 0,
            'cancellation_fee_percent' => 100,
        ]);

        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
            'status' => 'confirmed',
            'check_in' => now()->addDays(7),
            'check_out' => now()->addDays(9),
            'total_price' => 1000,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/bookings/{$booking->booking_code}");

        $response->assertOk();
        $data = $response->json('data.cancellation');
        $this->assertTrue($data['can_cancel']);
        $this->assertFalse($data['is_free']);
        $this->assertEquals(0, $data['refund_amount']);
    }

    public function test_cancelled_booking_cannot_be_cancelled_again(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
            'status' => 'cancelled',
            'check_in' => now()->addDays(7),
            'check_out' => now()->addDays(9),
            'total_price' => 1000,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/bookings/{$booking->booking_code}");

        $response->assertOk();
        $data = $response->json('data.cancellation');
        $this->assertFalse($data['can_cancel']);
    }

    public function test_expired_pending_booking_does_not_reduce_room_availability(): void
    {
        $this->roomType->update(['total_rooms' => 1]);

        Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
            'status' => 'pending',
            'check_in' => now()->addDays(3)->format('Y-m-d'),
            'check_out' => now()->addDays(5)->format('Y-m-d'),
            'guests' => 1,
            'created_at' => now()->subMinutes(31),
        ]);

        $availableRooms = $this->roomType->getAvailableRoomsCount(
            now()->addDays(3)->format('Y-m-d'),
            now()->addDays(5)->format('Y-m-d'),
        );

        $this->assertSame(1, $availableRooms);
    }
}
