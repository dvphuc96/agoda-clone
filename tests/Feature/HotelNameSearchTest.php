<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\Location;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotelNameSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_empty_q_returns_all_active_hotels(): void
    {
        Hotel::factory()->count(3)->create(['status' => 'active']);

        $response = $this->getJson('/api/hotels');

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_q_filters_by_name_substring_case_insensitively(): void
    {
        Hotel::factory()->create(['name' => 'Hilton Hanoi', 'status' => 'active']);
        Hotel::factory()->create(['name' => 'Sheraton Saigon', 'status' => 'active']);
        Hotel::factory()->create(['name' => 'Hanoi Hilton Hotel', 'status' => 'active']);

        $response = $this->getJson('/api/hotels?q=hilton');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_q_with_no_match_returns_empty_list(): void
    {
        Hotel::factory()->create(['name' => 'Hilton Hanoi', 'status' => 'active']);

        $response = $this->getJson('/api/hotels?q=NonexistentHotel');

        $response->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_q_with_like_special_chars_is_escaped(): void
    {
        Hotel::factory()->create(['name' => '100% Awesome Hotel', 'status' => 'active']);
        Hotel::factory()->create(['name' => 'Another Hotel', 'status' => 'active']);

        $response = $this->getJson('/api/hotels?q=' . urlencode('100%'));

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertSame('100% Awesome Hotel', $response->json('data.0.name'));
    }

    public function test_q_over_100_chars_is_rejected(): void
    {
        $longQuery = str_repeat('a', 101);

        $response = $this->getJson('/api/hotels?q=' . $longQuery);

        $response->assertStatus(422);
    }

    public function test_q_combines_with_location_filter(): void
    {
        $hanoi = Location::factory()->create(['slug' => 'hanoi']);
        $saigon = Location::factory()->create(['slug' => 'saigon']);

        Hotel::factory()->create([
            'name' => 'Hilton Hanoi',
            'status' => 'active',
            'location_id' => $hanoi->id,
        ]);
        Hotel::factory()->create([
            'name' => 'Hilton Saigon',
            'status' => 'active',
            'location_id' => $saigon->id,
        ]);

        $response = $this->getJson('/api/hotels?q=hilton&location=hanoi');

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertSame('Hilton Hanoi', $response->json('data.0.name'));
    }
}
