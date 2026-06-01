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

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
    }

    public function test_user_can_list_notifications(): void
    {
        $location = Location::factory()->create();
        $hotel = Hotel::factory()->create(['location_id' => $location->id]);
        $roomType = RoomType::factory()->create(['hotel_id' => $hotel->id]);
        $booking = Booking::factory()->create([
            'user_id' => $this->user->id,
            'room_type_id' => $roomType->id,
        ]);

        NotificationRecord::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'booking_id' => $booking->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/notifications');

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_user_only_sees_own_notifications(): void
    {
        $otherUser = User::factory()->create();
        NotificationRecord::factory()->create(['user_id' => $this->user->id]);
        NotificationRecord::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/notifications');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_notifications_require_auth(): void
    {
        $response = $this->getJson('/api/notifications');
        $response->assertUnauthorized();
    }
}
