<?php

namespace App\Http\Controllers\Api\Partner;

use App\Http\Resources\RoomTypeResource;
use App\Models\Hotel;
use App\Models\RoomType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerRoomTypeController extends PartnerController
{
    public function index(Request $request, Hotel $hotel)
    {
        $this->checkHotelOwnership($hotel->id);

        $roomTypes = $hotel->roomTypes()
            ->with('images')
            ->paginate($request->per_page ?? 15);

        return RoomTypeResource::collection($roomTypes);
    }

    public function store(Request $request, Hotel $hotel): JsonResponse
    {
        $this->checkHotelOwnership($hotel->id);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'max_guests' => ['required', 'integer', 'min:1'],
            'bed_type' => ['required', 'string', 'max:255'],
            'size_sqm' => ['nullable', 'integer', 'min:1'],
            'price_per_night' => ['required', 'numeric', 'min:0'],
            'amenities' => ['nullable', 'array'],
            'total_rooms' => ['required', 'integer', 'min:1'],
        ]);

        $roomType = $hotel->roomTypes()->create($data);

        return response()->json([
            'data' => new RoomTypeResource($roomType->load('images')),
            'message' => 'Room type created successfully',
        ], 201);
    }

    public function show(RoomType $roomType): RoomTypeResource
    {
        $this->checkHotelOwnership($roomType->hotel_id);

        return new RoomTypeResource($roomType->load(['hotel.location', 'images']));
    }

    public function update(Request $request, RoomType $roomType): RoomTypeResource
    {
        $this->checkHotelOwnership($roomType->hotel_id);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'max_guests' => ['sometimes', 'integer', 'min:1'],
            'bed_type' => ['sometimes', 'string', 'max:255'],
            'size_sqm' => ['nullable', 'integer', 'min:1'],
            'price_per_night' => ['sometimes', 'numeric', 'min:0'],
            'amenities' => ['nullable', 'array'],
            'total_rooms' => ['sometimes', 'integer', 'min:1'],
        ]);

        $roomType->update($data);

        return new RoomTypeResource($roomType->refresh()->load(['hotel.location', 'images']));
    }
}
