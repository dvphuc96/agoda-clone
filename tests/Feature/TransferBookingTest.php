<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\Location;
use App\Models\RoomType;
use App\Models\TransferBooking;
use App\Models\TransferRoute;
use App\Models\TransferVehicleType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TransferBookingTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $user;
    private Hotel $hotel;
    private TransferVehicleType $sedan;
    private TransferRoute $route;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->user = User::factory()->create(['role' => 'user', 'phone' => '0909000000']);
        $location = Location::factory()->create(['name' => 'Ho Chi Minh City']);
        $this->hotel = Hotel::factory()->create(['location_id' => $location->id, 'name' => 'GoStay Saigon']);
        $this->sedan = TransferVehicleType::factory()->create([
            'name' => 'Private Sedan',
            'passenger_capacity' => 3,
            'luggage_capacity' => 2,
            'is_active' => true,
        ]);
        $this->route = TransferRoute::factory()->create([
            'hotel_id' => $this->hotel->id,
            'transfer_vehicle_type_id' => $this->sedan->id,
            'airport_code' => 'SGN',
            'airport_name' => 'Tan Son Nhat International Airport',
            'direction' => 'airport_to_hotel',
            'price' => 350000,
            'currency' => 'VND',
            'is_active' => true,
        ]);
    }

    public function test_guest_can_quote_active_airport_transfer_routes(): void
    {
        TransferRoute::factory()->create([
            'hotel_id' => $this->hotel->id,
            'airport_code' => 'SGN',
            'direction' => 'airport_to_hotel',
            'is_active' => false,
        ]);

        $response = $this->getJson("/api/transfers/quotes?airport_code=SGN&hotel_id={$this->hotel->id}&direction=airport_to_hotel&passengers=2");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.route_id', $this->route->id)
            ->assertJsonPath('data.0.vehicle_type.name', 'Private Sedan')
            ->assertJsonPath('data.0.price', '350000.00');
    }

    public function test_admin_can_refresh_route_distance_from_map_and_recalculate_price(): void
    {
        $this->hotel->update([
            'latitude' => 21.0245,
            'longitude' => 105.8575,
        ]);
        $this->route->update([
            'pickup_latitude' => 21.2142,
            'pickup_longitude' => 105.8028,
            'base_fee' => 50000,
            'price_per_km' => 14000,
            'price_override' => null,
        ]);

        Http::fake([
            'router.project-osrm.org/*' => Http::response([
                'code' => 'Ok',
                'routes' => [[
                    'distance' => 28020.4,
                    'duration' => 2150.0,
                ]],
            ]),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/transfer-routes/{$this->route->id}/refresh-distance");

        $response->assertOk()
            ->assertJsonPath('data.distance_meters', 28020)
            ->assertJsonPath('data.distance_km', 28.02)
            ->assertJsonPath('data.duration_minutes', 36)
            ->assertJsonPath('data.price', '443000.00');

        $this->assertDatabaseHas('transfer_routes', [
            'id' => $this->route->id,
            'distance_meters' => 28020,
            'duration_seconds' => 2150,
            'price' => 443000,
            'pricing_source' => 'map',
        ]);
    }

    public function test_price_override_is_kept_when_refreshing_map_distance(): void
    {
        $this->hotel->update([
            'latitude' => 21.0245,
            'longitude' => 105.8575,
        ]);
        $this->route->update([
            'pickup_latitude' => 21.2142,
            'pickup_longitude' => 105.8028,
            'base_fee' => 50000,
            'price_per_km' => 14000,
            'price_override' => 399000,
        ]);

        Http::fake([
            'router.project-osrm.org/*' => Http::response([
                'code' => 'Ok',
                'routes' => [[
                    'distance' => 28020.4,
                    'duration' => 2150.0,
                ]],
            ]),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/transfer-routes/{$this->route->id}/refresh-distance");

        $response->assertOk()
            ->assertJsonPath('data.price', '399000.00')
            ->assertJsonPath('data.pricing_source', 'override');
    }

    public function test_guest_can_quote_transfers_for_a_hotel_without_selecting_airport_code(): void
    {
        TransferRoute::factory()->create([
            'hotel_id' => $this->hotel->id,
            'transfer_vehicle_type_id' => $this->sedan->id,
            'airport_code' => 'SGN',
            'direction' => 'hotel_to_airport',
            'price' => 360000,
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/transfers/hotels/{$this->hotel->id}/quotes?direction=airport_to_hotel&passengers=2");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.airport_code', 'SGN')
            ->assertJsonPath('data.0.route_id', $this->route->id);
    }

    public function test_user_can_create_transfer_booking_from_quote(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/transfers/bookings', [
            'transfer_route_id' => $this->route->id,
            'pickup_datetime' => now()->addDay()->setTime(10, 30)->format('Y-m-d H:i:s'),
            'passengers' => 2,
            'contact_name' => 'Nguyen Van A',
            'contact_phone' => '0909123456',
            'flight_number' => 'VN123',
            'special_requests' => 'Please wait at arrivals.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.booking_code', fn (string $code) => str_starts_with($code, 'TR'))
            ->assertJsonPath('data.total_price', '350000.00')
            ->assertJsonPath('data.vehicle_type.name', 'Private Sedan');

        $this->assertDatabaseHas('transfer_bookings', [
            'user_id' => $this->user->id,
            'transfer_route_id' => $this->route->id,
            'status' => 'pending',
            'total_price' => 350000,
        ]);
    }

    public function test_user_can_add_airport_transfer_while_creating_room_booking(): void
    {
        $roomType = RoomType::factory()->create([
            'hotel_id' => $this->hotel->id,
            'max_guests' => 3,
            'price_per_night' => 1000000,
            'total_rooms' => 5,
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/bookings', [
            'room_type_id' => $roomType->id,
            'check_in' => now()->addDays(2)->format('Y-m-d'),
            'check_out' => now()->addDays(4)->format('Y-m-d'),
            'guests' => 2,
            'special_requests' => 'High floor',
            'transfer_add_on' => [
                'transfer_route_id' => $this->route->id,
                'pickup_datetime' => now()->addDays(2)->setTime(9, 30)->format('Y-m-d H:i:s'),
                'contact_name' => 'Nguyen Van A',
                'contact_phone' => '0909123456',
                'flight_number' => 'VN123',
                'special_requests' => 'Meet at arrivals',
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.transfer_bookings.0.status', 'pending')
            ->assertJsonPath('data.transfer_bookings.0.total_price', '350000.00')
            ->assertJsonPath('data.transfer_bookings.0.vehicle_type.name', 'Private Sedan');

        $bookingId = $response->json('data.id');

        $this->assertDatabaseHas('transfer_bookings', [
            'booking_id' => $bookingId,
            'user_id' => $this->user->id,
            'transfer_route_id' => $this->route->id,
            'status' => 'pending',
        ]);
    }

    public function test_room_booking_rejects_transfer_route_for_another_hotel(): void
    {
        $roomType = RoomType::factory()->create([
            'hotel_id' => $this->hotel->id,
            'max_guests' => 3,
            'total_rooms' => 5,
        ]);
        $otherHotel = Hotel::factory()->create(['location_id' => Location::factory()->create()->id]);
        $otherRoute = TransferRoute::factory()->create([
            'hotel_id' => $otherHotel->id,
            'transfer_vehicle_type_id' => $this->sedan->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/bookings', [
            'room_type_id' => $roomType->id,
            'check_in' => now()->addDays(2)->format('Y-m-d'),
            'check_out' => now()->addDays(4)->format('Y-m-d'),
            'guests' => 2,
            'transfer_add_on' => [
                'transfer_route_id' => $otherRoute->id,
                'pickup_datetime' => now()->addDays(2)->setTime(9, 30)->format('Y-m-d H:i:s'),
                'contact_name' => 'Nguyen Van A',
                'contact_phone' => '0909123456',
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Tuyen xe khong thuoc khach san dang dat');
    }

    public function test_user_cannot_create_transfer_booking_above_vehicle_capacity(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/transfers/bookings', [
            'transfer_route_id' => $this->route->id,
            'pickup_datetime' => now()->addDay()->format('Y-m-d H:i:s'),
            'passengers' => 5,
            'contact_name' => 'Nguyen Van A',
            'contact_phone' => '0909123456',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'So khach vuot qua suc chua cua xe');
    }

    public function test_user_only_sees_own_transfer_bookings(): void
    {
        $ownBooking = TransferBooking::factory()->create([
            'user_id' => $this->user->id,
            'transfer_route_id' => $this->route->id,
            'transfer_vehicle_type_id' => $this->sedan->id,
        ]);
        $otherUser = User::factory()->create();
        TransferBooking::factory()->create([
            'user_id' => $otherUser->id,
            'transfer_route_id' => $this->route->id,
            'transfer_vehicle_type_id' => $this->sedan->id,
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/transfers/bookings');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.booking_code', $ownBooking->booking_code);
    }

    public function test_admin_can_update_transfer_booking_status(): void
    {
        $booking = TransferBooking::factory()->create([
            'user_id' => $this->user->id,
            'transfer_route_id' => $this->route->id,
            'transfer_vehicle_type_id' => $this->sedan->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/admin/transfer-bookings/{$booking->id}/status", ['status' => 'confirmed']);

        $response->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('transfer_bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_admin_can_create_transfer_vehicle_type_and_route(): void
    {
        $vehicleResponse = $this->actingAs($this->admin)->postJson('/api/admin/transfer-vehicle-types', [
            'name' => 'Airport Van',
            'passenger_capacity' => 8,
            'luggage_capacity' => 6,
            'is_active' => true,
        ]);

        $vehicleResponse->assertCreated()
            ->assertJsonPath('data.name', 'Airport Van');

        $routeResponse = $this->actingAs($this->admin)->postJson('/api/admin/transfer-routes', [
            'hotel_id' => $this->hotel->id,
            'transfer_vehicle_type_id' => $vehicleResponse->json('data.id'),
            'airport_code' => 'sgn',
            'airport_name' => 'Tan Son Nhat International Airport',
            'direction' => 'hotel_to_airport',
            'price' => 520000,
            'currency' => 'VND',
            'duration_minutes' => 40,
            'base_fee' => 50000,
            'price_per_km' => 14000,
            'is_active' => true,
        ]);

        $routeResponse->assertCreated()
            ->assertJsonPath('data.airport_code', 'SGN')
            ->assertJsonPath('data.price', '520000.00');

        $this->assertDatabaseHas('transfer_routes', [
            'hotel_id' => $this->hotel->id,
            'airport_code' => 'SGN',
            'direction' => 'hotel_to_airport',
        ]);
    }

    public function test_non_admin_cannot_access_transfer_admin_api(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/admin/transfer-bookings');

        $response->assertForbidden();
    }
}
