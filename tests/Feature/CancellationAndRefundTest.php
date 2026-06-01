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

class CancellationAndRefundTest extends TestCase
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

    // --- Cancel request (user) ---

    public function test_user_can_cancel_confirmed_booking_without_policy(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
            'status' => 'confirmed',
            'check_in' => now()->addDays(7),
            'check_out' => now()->addDays(9),
            'total_price' => 1000,
        ]);
        Payment::factory()->create([
            'booking_id' => $booking->id,
            'status' => 'success',
            'amount' => 1000,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/bookings/{$booking->booking_code}/cancel-request", [
                'reason' => 'Thay doi ke hoach',
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Yeu cau huy dat phong da duoc tao');

        $this->assertDatabaseHas('refunds', [
            'booking_id' => $booking->id,
            'status' => 'approved',
            'amount' => 1000,
        ]);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'cancelled',
        ]);

        $this->assertDatabaseHas('notification_records', [
            'user_id' => $this->user->id,
            'booking_id' => $booking->id,
            'type' => 'booking_cancelled',
        ]);
    }

    public function test_user_cancel_confirmed_with_fee_creates_pending_refund(): void
    {
        BookingPolicy::factory()->create([
            'hotel_id' => $this->hotel->id,
            'free_cancellation_hours' => 48,
            'cancellation_fee_percent' => 30,
        ]);

        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
            'status' => 'confirmed',
            'check_in' => now()->addHours(24),
            'check_out' => now()->addDays(3),
            'total_price' => 1000,
        ]);
        Payment::factory()->create([
            'booking_id' => $booking->id,
            'status' => 'success',
            'amount' => 1000,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/bookings/{$booking->booking_code}/cancel-request");

        $response->assertOk();

        $this->assertDatabaseHas('refunds', [
            'booking_id' => $booking->id,
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('notification_records', [
            'booking_id' => $booking->id,
            'type' => 'cancellation_requested',
        ]);

        // Booking NOT yet cancelled - awaiting admin approval
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_user_cannot_cancel_others_booking(): void
    {
        $otherUser = User::factory()->create();
        $booking = Booking::factory()->create([
            'user_id' => $otherUser->id,
            'room_type_id' => $this->roomType->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/bookings/{$booking->booking_code}/cancel-request");

        $response->assertNotFound();
    }

    public function test_user_cannot_double_cancel(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
            'status' => 'confirmed',
            'check_in' => now()->addDays(7),
            'total_price' => 1000,
        ]);

        $this->actingAs($this->user)
            ->postJson("/api/bookings/{$booking->booking_code}/cancel-request");

        $response = $this->actingAs($this->user)
            ->postJson("/api/bookings/{$booking->booking_code}/cancel-request");

        $response->assertStatus(422);
    }

    public function test_completed_booking_cannot_be_cancelled(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
            'status' => 'completed',
            'total_price' => 1000,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/bookings/{$booking->booking_code}/cancel-request");

        $response->assertStatus(422);
    }

    // --- Admin refund management ---

    public function test_admin_can_list_refunds(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
        ]);
        Refund::factory()->count(3)->create([
            'booking_id' => $booking->id,
            'requested_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/refunds');

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_admin_can_show_refund(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
        ]);
        $refund = Refund::factory()->create([
            'booking_id' => $booking->id,
            'requested_by' => $this->user->id,
            'amount' => 500,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/refunds/{$refund->id}");

        $response->assertOk()
            ->assertJsonPath('data.amount', '500.00');
    }

    public function test_admin_can_approve_refund(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
            'status' => 'confirmed',
            'total_price' => 1000,
        ]);
        $payment = Payment::factory()->create([
            'booking_id' => $booking->id,
            'status' => 'success',
        ]);
        $refund = Refund::factory()->create([
            'booking_id' => $booking->id,
            'payment_id' => $payment->id,
            'requested_by' => $this->user->id,
            'status' => 'pending',
            'amount' => 700,
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/admin/refunds/{$refund->id}/status", [
                'status' => 'approved',
                'admin_notes' => 'Duyet hoan tien',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'cancelled',
        ]);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'refunded',
        ]);

        $this->assertDatabaseHas('notification_records', [
            'booking_id' => $booking->id,
            'type' => 'refund_approved',
        ]);
    }

    public function test_admin_can_reject_refund(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
        ]);
        $refund = Refund::factory()->create([
            'booking_id' => $booking->id,
            'requested_by' => $this->user->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/admin/refunds/{$refund->id}/status", [
                'status' => 'rejected',
                'admin_notes' => 'Khong du dieu kien',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $this->assertDatabaseHas('notification_records', [
            'booking_id' => $booking->id,
            'type' => 'refund_rejected',
        ]);
    }

    public function test_admin_can_mark_approved_refund_as_processed(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
        ]);
        $refund = Refund::factory()->create([
            'booking_id' => $booking->id,
            'requested_by' => $this->user->id,
            'processed_by' => $this->admin->id,
            'processed_at' => now(),
            'status' => 'approved',
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/admin/refunds/{$refund->id}/status", [
                'status' => 'processed',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'processed');

        $this->assertDatabaseHas('refunds', [
            'id' => $refund->id,
            'status' => 'processed',
        ]);
    }

    public function test_admin_cannot_approve_already_processed_refund(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
        ]);
        $refund = Refund::factory()->create([
            'booking_id' => $booking->id,
            'requested_by' => $this->user->id,
            'status' => 'approved',
            'processed_by' => $this->admin->id,
            'processed_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/admin/refunds/{$refund->id}/status", [
                'status' => 'approved',
            ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_filter_refunds_by_status(): void
    {
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $this->roomType->id,
        ]);
        Refund::factory()->create([
            'booking_id' => $booking->id,
            'requested_by' => $this->user->id,
            'status' => 'pending',
        ]);
        Refund::factory()->create([
            'booking_id' => $booking->id,
            'requested_by' => $this->user->id,
            'status' => 'approved',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/refunds?status=pending');

        $response->assertOk()->assertJsonCount(1, 'data');
    }
}
