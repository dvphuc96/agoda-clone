<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Hotel;
use App\Models\Location;
use App\Models\NotificationRecord;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationReadStatusTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $location = Location::factory()->create();
        $hotel = Hotel::factory()->create(['location_id' => $location->id]);
        $roomType = RoomType::factory()->create(['hotel_id' => $hotel->id]);
        $this->booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $roomType->id,
        ]);
    }

    public function test_unauthenticated_requests_get_401(): void
    {
        $this->getJson('/api/notifications/unread-count')->assertUnauthorized();
        $this->postJson('/api/notifications/mark-all-read')->assertUnauthorized();

        $notification = NotificationRecord::factory()->create([
            'user_id' => $this->user->id,
            'booking_id' => $this->booking->id,
        ]);
        $this->postJson("/api/notifications/{$notification->id}/read")->assertUnauthorized();
        $this->deleteJson("/api/notifications/{$notification->id}")->assertUnauthorized();
    }

    public function test_unread_count_starts_at_zero_for_fresh_user(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/notifications/unread-count');

        $response->assertOk()->assertJson(['count' => 0]);
    }

    public function test_mark_as_read_sets_read_at_timestamp(): void
    {
        $notification = NotificationRecord::factory()->create([
            'user_id' => $this->user->id,
            'booking_id' => $this->booking->id,
            'read_at' => null,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/notifications/{$notification->id}/read");

        $response->assertOk();
        $this->assertNotNull($notification->fresh()->read_at);
        $this->assertTrue($notification->fresh()->isRead());
    }

    public function test_mark_as_read_is_idempotent(): void
    {
        $fixedTime = now();
        $notification = NotificationRecord::factory()->create([
            'user_id' => $this->user->id,
            'booking_id' => $this->booking->id,
            'read_at' => $fixedTime,
        ]);

        $this->actingAs($this->user)
            ->postJson("/api/notifications/{$notification->id}/read")
            ->assertOk();

        // Second call shouldn't change the timestamp
        $this->assertEquals(
            $fixedTime->timestamp,
            $notification->fresh()->read_at->timestamp,
        );
    }

    public function test_mark_all_read_sets_read_at_on_all_unread(): void
    {
        NotificationRecord::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'booking_id' => $this->booking->id,
            'read_at' => null,
        ]);

        $otherUser = User::factory()->create();
        $otherBooking = Booking::factory()->create(['user_id' => $otherUser->id]);
        NotificationRecord::factory()->create([
            'user_id' => $otherUser->id,
            'booking_id' => $otherBooking->id,
            'read_at' => null,
        ]);

        $this->actingAs($this->user)
            ->postJson('/api/notifications/mark-all-read')
            ->assertOk();

        $this->assertEquals(0, $this->user->notificationRecords()->unread()->count());
        $this->assertEquals(1, $otherUser->notificationRecords()->unread()->count());
    }

    public function test_destroy_deletes_notification(): void
    {
        $notification = NotificationRecord::factory()->create([
            'user_id' => $this->user->id,
            'booking_id' => $this->booking->id,
        ]);

        $this->actingAs($this->user)
            ->deleteJson("/api/notifications/{$notification->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('notification_records', ['id' => $notification->id]);
    }

    public function test_user_cannot_access_other_users_notifications(): void
    {
        $otherUser = User::factory()->create();
        $otherBooking = Booking::factory()->create(['user_id' => $otherUser->id]);
        $notification = NotificationRecord::factory()->create([
            'user_id' => $otherUser->id,
            'booking_id' => $otherBooking->id,
            'read_at' => null,
        ]);

        $this->actingAs($this->user)
            ->postJson("/api/notifications/{$notification->id}/read")
            ->assertNotFound();

        $this->actingAs($this->user)
            ->deleteJson("/api/notifications/{$notification->id}")
            ->assertNotFound();

        // Confirm nothing changed
        $this->assertNotNull($notification->fresh());
        $this->assertNull($notification->fresh()->read_at);
    }

    public function test_unread_count_reflects_mutations(): void
    {
        NotificationRecord::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'booking_id' => $this->booking->id,
            'read_at' => null,
        ]);

        $initial = $this->actingAs($this->user)
            ->getJson('/api/notifications/unread-count')
            ->json('count');
        $this->assertEquals(2, $initial);

        $this->actingAs($this->user)
            ->postJson('/api/notifications/mark-all-read')
            ->assertOk();

        $after = $this->actingAs($this->user)
            ->getJson('/api/notifications/unread-count')
            ->json('count');
        $this->assertEquals(0, $after);
    }
}
