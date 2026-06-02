<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransferRouteResource;
use App\Models\TransferRoute;
use App\Services\MapDistanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TransferRouteController extends Controller
{
    public function __construct(private MapDistanceService $mapDistanceService) {}

    public function index(Request $request)
    {
        $query = TransferRoute::query()
            ->with(['hotel.location', 'vehicleType'])
            ->latest();

        if ($request->filled('hotel_id')) {
            $query->where('hotel_id', $request->hotel_id);
        }
        if ($request->filled('airport_code')) {
            $query->where('airport_code', strtoupper($request->airport_code));
        }
        if ($request->filled('direction')) {
            $query->where('direction', $request->direction);
        }

        return TransferRouteResource::collection($query->paginate((int) $request->input('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['airport_code'] = strtoupper($data['airport_code']);

        $route = TransferRoute::create($data)->load(['hotel.location', 'vehicleType']);

        return (new TransferRouteResource($route))
            ->response()
            ->setStatusCode(201);
    }

    public function show(TransferRoute $transferRoute): TransferRouteResource
    {
        return new TransferRouteResource($transferRoute->load(['hotel.location', 'vehicleType']));
    }

    public function update(Request $request, TransferRoute $transferRoute): TransferRouteResource
    {
        $data = $this->validated($request);
        $data['airport_code'] = strtoupper($data['airport_code']);
        $transferRoute->update($data);

        return new TransferRouteResource($transferRoute->refresh()->load(['hotel.location', 'vehicleType']));
    }

    public function refreshDistance(TransferRoute $transferRoute): TransferRouteResource|JsonResponse
    {
        try {
            $route = $this->mapDistanceService->refreshRouteDistance($transferRoute);

            return new TransferRouteResource($route->load(['hotel.location', 'vehicleType']));
        } catch (\InvalidArgumentException|\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(TransferRoute $transferRoute): JsonResponse
    {
        abort_if($transferRoute->bookings()->exists(), 422, 'Cannot delete a route with transfer bookings.');
        $transferRoute->delete();

        return response()->json(['message' => 'Transfer route deleted.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'hotel_id' => ['required', 'exists:hotels,id'],
            'transfer_vehicle_type_id' => ['required', 'exists:transfer_vehicle_types,id'],
            'airport_code' => ['required', 'string', 'max:10'],
            'airport_name' => ['required', 'string', 'max:255'],
            'pickup_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'pickup_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'direction' => ['required', Rule::in(['airport_to_hotel', 'hotel_to_airport'])],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'distance_meters' => ['nullable', 'integer', 'min:1'],
            'duration_seconds' => ['nullable', 'integer', 'min:1'],
            'base_fee' => ['required', 'numeric', 'min:0'],
            'price_per_km' => ['required', 'numeric', 'min:0'],
            'price_override' => ['nullable', 'numeric', 'min:0'],
            'pricing_source' => ['nullable', Rule::in(['manual', 'map', 'override'])],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}
