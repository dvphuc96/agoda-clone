<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CacheService
{
    private const NAMESPACE = 'gostay';

    private const TTL = [
        'search' => 300,       // 5 minutes
        'detail' => 600,       // 10 minutes
        'featured' => 900,     // 15 minutes
        'locations' => 1800,   // 30 minutes
        'rooms' => 180,        // 3 minutes
        'location_hotels' => 600, // 10 minutes
    ];

    public function hotelSearchKey(array $params): string
    {
        ksort($params);
        $hash = md5(serialize($params));

        return self::NAMESPACE . ':hotel:search:' . $hash;
    }

    public function hotelDetailKey(string $slug): string
    {
        return self::NAMESPACE . ':hotel:detail:' . $slug;
    }

    public function featuredHotelsKey(): string
    {
        return self::NAMESPACE . ':hotel:featured';
    }

    public function locationsKey(): string
    {
        return self::NAMESPACE . ':locations';
    }

    public function availabilityCalendarKey(int $roomTypeId, string $month): string
    {
        return self::NAMESPACE . ':availability:' . $roomTypeId . ':' . $month;
    }

    public function hotelRoomsKey(string $slug, string $checkIn, string $checkOut): string
    {
        return self::NAMESPACE . ':hotel:rooms:' . $slug . ':' . $checkIn . ':' . $checkOut;
    }

    public function locationHotelsKey(string $slug, int $page): string
    {
        return self::NAMESPACE . ':location:hotels:' . $slug . ':' . $page;
    }

    public function remember(string $key, int $ttl, callable $callback, array $tags = [])
    {
        try {
            if (!empty($tags)) {
                return Cache::tags($tags)->remember($key, $ttl, $callback);
            }

            return Cache::remember($key, $ttl, $callback);
        } catch (\Throwable $e) {
            Log::warning('Cache read failed, falling back to direct query', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);

            return $callback();
        }
    }

    public function forget(string $key): bool
    {
        try {
            return Cache::forget($key);
        } catch (\Throwable $e) {
            Log::warning('Cache forget failed', ['key' => $key, 'error' => $e->getMessage()]);
            return false;
        }
    }

    public function forgetHotel(string $slug): void
    {
        try {
            $this->forget($this->hotelDetailKey($slug));
            $this->forget($this->featuredHotelsKey());
            $this->flushTag('hotel:' . $slug);
            $this->flushTag('search');
        } catch (\Throwable $e) {
            Log::warning('Cache invalidation failed for hotel', ['slug' => $slug, 'error' => $e->getMessage()]);
        }
    }

    public function forgetLocation(string $slug): void
    {
        try {
            $this->forget($this->locationsKey());
            $this->flushTag('location:' . $slug);
            $this->flushTag('search');
        } catch (\Throwable $e) {
            Log::warning('Cache invalidation failed for location', ['slug' => $slug, 'error' => $e->getMessage()]);
        }
    }

    public function forgetRoomAvailability(int $roomTypeId): void
    {
        try {
            $this->flushTag('availability:' . $roomTypeId);
        } catch (\Throwable $e) {
            Log::warning('Cache invalidation failed for room availability', ['roomTypeId' => $roomTypeId, 'error' => $e->getMessage()]);
        }
    }

    public function flushTags(array $tags): void
    {
        try {
            Cache::tags($tags)->flush();
        } catch (\Throwable $e) {
            Log::warning('Cache tag flush failed', ['tags' => $tags, 'error' => $e->getMessage()]);
        }
    }

    public function flushTag(string $tag): void
    {
        $this->flushTags([$tag]);
    }

    public function getTtl(string $type): int
    {
        return self::TTL[$type] ?? 300;
    }
}
