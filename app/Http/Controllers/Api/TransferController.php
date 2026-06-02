<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HotelResource;
use App\Http\Resources\TransferVehicleTypeResource;
use App\Models\Hotel;
use App\Models\TransferRoute;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class TransferController extends Controller
{
    public function searchOptions()
    {
        $airports = TransferRoute::query()
            ->where('is_active', true)
            ->select(['airport_code', 'airport_name'])
            ->distinct()
            ->orderBy('airport_name')
            ->get();

        $hotels = Hotel::query()
            ->whereHas('transferRoutes', fn ($query) => $query->where('is_active', true))
            ->with('location')
            ->orderBy('name')
            ->get();

        return response()->json([
            'airports' => $airports,
            'hotels' => HotelResource::collection($hotels),
            'directions' => ['airport_to_hotel', 'hotel_to_airport'],
        ]);
    }

    public function quotes(Request $request)
    {
        $data = $request->validate([
            'airport_code' => ['required', 'string', 'max:10'],
            'hotel_id' => ['required', 'exists:hotels,id'],
            'direction' => ['required', 'in:airport_to_hotel,hotel_to_airport'],
            'passengers' => ['required', 'integer', 'min:1'],
        ]);

        $routes = TransferRoute::query()
            ->with(['vehicleType', 'hotel.location'])
            ->where('is_active', true)
            ->where('airport_code', strtoupper($data['airport_code']))
            ->where('hotel_id', $data['hotel_id'])
            ->where('direction', $data['direction'])
            ->whereHas('vehicleType', function ($query) use ($data) {
                $query->where('is_active', true)
                    ->where('passenger_capacity', '>=', $data['passengers']);
            })
            ->orderBy('price')
            ->get();

        return response()->json(['data' => $this->quotePayload($routes)]);
    }

    public function hotelQuotes(Request $request, Hotel $hotel)
    {
        $data = $request->validate([
            'direction' => ['required', 'in:airport_to_hotel,hotel_to_airport'],
            'passengers' => ['required', 'integer', 'min:1'],
        ]);

        $routes = TransferRoute::query()
            ->with(['vehicleType', 'hotel.location'])
            ->where('is_active', true)
            ->where('hotel_id', $hotel->id)
            ->where('direction', $data['direction'])
            ->whereHas('vehicleType', function ($query) use ($data) {
                $query->where('is_active', true)
                    ->where('passenger_capacity', '>=', $data['passengers']);
            })
            ->orderBy('price')
            ->get();

        return response()->json(['data' => $this->quotePayload($routes)]);
    }

    private function quotePayload(Collection $routes): Collection
    {
        return $routes->map(fn (TransferRoute $route) => [
            'route_id' => $route->id,
            'airport_code' => $route->airport_code,
            'airport_name' => $route->airport_name,
            'direction' => $route->direction,
            'price' => $route->price,
            'currency' => $route->currency,
            'duration_minutes' => $route->duration_minutes,
            'distance_meters' => $route->distance_meters,
            'distance_km' => $route->distance_meters ? round($route->distance_meters / 1000, 2) : null,
            'hotel' => new HotelResource($route->hotel),
            'vehicle_type' => new TransferVehicleTypeResource($route->vehicleType),
        ])->values();
    }
}
