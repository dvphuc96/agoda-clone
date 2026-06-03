<?php

namespace App\Http\Controllers\Api\Partner;

use App\Http\Resources\PriceOverrideResource;
use App\Models\PriceOverride;
use App\Models\RoomType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerPriceOverrideController extends PartnerController
{
    public function index(Request $request, RoomType $roomType)
    {
        $this->checkHotelOwnership($roomType->hotel_id);

        $overrides = $roomType->priceOverrides()
            ->orderBy('start_date', 'desc')
            ->paginate($request->per_page ?? 20);

        return PriceOverrideResource::collection($overrides);
    }

    public function store(Request $request, RoomType $roomType): JsonResponse
    {
        $this->checkHotelOwnership($roomType->hotel_id);

        $data = $request->validate([
            'start_date' => ['required', 'date', 'before_or_equal:end_date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'price_per_night' => ['required', 'numeric', 'gt:0'],
            'label' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        $override = $roomType->priceOverrides()->create($data);

        return response()->json([
            'data' => new PriceOverrideResource($override),
            'message' => 'Price override created successfully',
        ], 201);
    }

    public function update(Request $request, PriceOverride $priceOverride): JsonResponse
    {
        $this->checkHotelOwnership($priceOverride->roomType->hotel_id);

        $data = $request->validate([
            'start_date' => ['sometimes', 'required', 'date', 'before_or_equal:end_date'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'price_per_night' => ['sometimes', 'required', 'numeric', 'gt:0'],
            'label' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        $priceOverride->update($data);

        return response()->json([
            'data' => new PriceOverrideResource($priceOverride),
            'message' => 'Price override updated successfully',
        ]);
    }

    public function toggleActive(PriceOverride $priceOverride): JsonResponse
    {
        $this->checkHotelOwnership($priceOverride->roomType->hotel_id);

        $priceOverride->update(['is_active' => !$priceOverride->is_active]);

        return response()->json([
            'data' => new PriceOverrideResource($priceOverride),
            'message' => 'Price override toggled successfully',
        ]);
    }
}
