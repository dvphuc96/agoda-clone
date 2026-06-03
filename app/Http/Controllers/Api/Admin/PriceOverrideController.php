<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePriceOverrideRequest;
use App\Http\Requests\Admin\UpdatePriceOverrideRequest;
use App\Http\Resources\PriceOverrideResource;
use App\Models\PriceOverride;
use App\Models\RoomType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PriceOverrideController extends Controller
{
    public function index(Request $request, RoomType $roomType): AnonymousResourceCollection
    {
        $overrides = $roomType->priceOverrides()
            ->orderBy('start_date', 'desc')
            ->paginate($request->per_page ?? 20);

        return PriceOverrideResource::collection($overrides);
    }

    public function store(StorePriceOverrideRequest $request, RoomType $roomType): JsonResponse
    {
        $override = $roomType->priceOverrides()->create($request->validated());

        return response()->json([
            'data' => new PriceOverrideResource($override),
            'message' => 'Price override created successfully',
        ], 201);
    }

    public function show(RoomType $roomType, PriceOverride $priceOverride): PriceOverrideResource
    {
        return new PriceOverrideResource($priceOverride);
    }

    public function update(UpdatePriceOverrideRequest $request, RoomType $roomType, PriceOverride $priceOverride): JsonResponse
    {
        $priceOverride->update($request->validated());

        return response()->json([
            'data' => new PriceOverrideResource($priceOverride),
            'message' => 'Price override updated successfully',
        ]);
    }

    public function destroy(RoomType $roomType, PriceOverride $priceOverride): JsonResponse
    {
        $priceOverride->delete();

        return response()->json([
            'message' => 'Price override deleted successfully',
        ]);
    }

    public function toggleActive(RoomType $roomType, PriceOverride $priceOverride): JsonResponse
    {
        $priceOverride->update(['is_active' => !$priceOverride->is_active]);

        return response()->json([
            'data' => new PriceOverrideResource($priceOverride),
            'message' => 'Price override toggled successfully',
        ]);
    }
}
