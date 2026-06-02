<?php

namespace App\Services;

use App\Models\TransferRoute;
use Illuminate\Support\Facades\Http;

class MapDistanceService
{
    public function refreshRouteDistance(TransferRoute $route): TransferRoute
    {
        $route->loadMissing('hotel');

        if (! $route->pickup_latitude || ! $route->pickup_longitude || ! $route->hotel?->latitude || ! $route->hotel?->longitude) {
            throw new \InvalidArgumentException('Tuyen xe can toa do diem don va khach san de tinh khoang cach');
        }

        $response = Http::timeout(10)->get($this->osrmUrl($route));
        if (! $response->ok() || $response->json('code') !== 'Ok') {
            throw new \RuntimeException('Khong the lay khoang cach tu ban do');
        }

        $mapRoute = $response->json('routes.0');
        if (! is_array($mapRoute) || ! isset($mapRoute['distance'], $mapRoute['duration'])) {
            throw new \RuntimeException('Du lieu khoang cach khong hop le');
        }

        $distanceMeters = (int) round((float) $mapRoute['distance']);
        $durationSeconds = (int) round((float) $mapRoute['duration']);

        $route->fill([
            'distance_meters' => $distanceMeters,
            'duration_seconds' => $durationSeconds,
            'duration_minutes' => (int) ceil($durationSeconds / 60),
        ]);
        $route->price = $this->calculatePrice($route);
        $route->pricing_source = $route->price_override !== null ? 'override' : 'map';
        $route->save();

        return $route->refresh();
    }

    public function calculatePrice(TransferRoute $route): float
    {
        if ($route->price_override !== null) {
            return (float) $route->price_override;
        }

        $distanceKm = ((int) $route->distance_meters) / 1000;
        $rawPrice = (float) $route->base_fee + ($distanceKm * (float) $route->price_per_km);

        return ceil($rawPrice / 1000) * 1000;
    }

    private function osrmUrl(TransferRoute $route): string
    {
        $baseUrl = rtrim(config('services.maps.osrm_url', 'https://router.project-osrm.org'), '/');
        $coordinates = implode(';', [
            "{$route->pickup_longitude},{$route->pickup_latitude}",
            "{$route->hotel->longitude},{$route->hotel->latitude}",
        ]);

        return "{$baseUrl}/route/v1/driving/{$coordinates}?overview=false&steps=false";
    }
}
