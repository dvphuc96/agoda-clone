<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransferVehicleTypeResource;
use App\Models\TransferVehicleType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TransferVehicleTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = TransferVehicleType::query()->orderBy('name');

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return TransferVehicleTypeResource::collection($query->paginate((int) $request->input('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return (new TransferVehicleTypeResource(TransferVehicleType::create($data)))
            ->response()
            ->setStatusCode(201);
    }

    public function show(TransferVehicleType $transferVehicleType): TransferVehicleTypeResource
    {
        return new TransferVehicleTypeResource($transferVehicleType);
    }

    public function update(Request $request, TransferVehicleType $transferVehicleType): TransferVehicleTypeResource
    {
        $data = $this->validated($request, $transferVehicleType->id);
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $transferVehicleType->update($data);

        return new TransferVehicleTypeResource($transferVehicleType->refresh());
    }

    public function destroy(TransferVehicleType $transferVehicleType): JsonResponse
    {
        abort_if($transferVehicleType->routes()->exists(), 422, 'Cannot delete a vehicle type with transfer routes.');
        $transferVehicleType->delete();

        return response()->json(['message' => 'Vehicle type deleted.']);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('transfer_vehicle_types', 'slug')->ignore($ignoreId)],
            'description' => ['nullable', 'string'],
            'passenger_capacity' => ['required', 'integer', 'min:1', 'max:99'],
            'luggage_capacity' => ['required', 'integer', 'min:0', 'max:99'],
            'image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}
