<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomTypeResource;
use App\Models\Hotel;
use App\Models\HotelImage;
use App\Models\RoomType;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomTypeController extends Controller
{
    public function __construct(
        private CacheService $cache,
    ) {}
    public function index(Hotel $hotel)
    {
        abort_if(!$hotel->exists, 404, 'Hotel not found.');

        $query = $hotel->roomTypes()->with('images');

        if (request()->filled('min_price')) {
            $query->where('price_per_night', '>=', request()->min_price);
        }
        if (request()->filled('max_price')) {
            $query->where('price_per_night', '<=', request()->max_price);
        }
        if (request()->filled('amenity')) {
            $query->whereJsonContains('amenities', request()->amenity);
        }
        if (request()->filled('bed_type')) {
            $query->where('bed_type', request()->bed_type);
        }

        return RoomTypeResource::collection($query->paginate(15));
    }

    public function store(Request $request, Hotel $hotel): JsonResponse
    {
        $roomType = $hotel->roomTypes()->create($this->validated($request));

        $this->cache->forgetHotel($hotel->slug);

        return response()->json(new RoomTypeResource($roomType->load('images')), 201);
    }

    public function show(RoomType $roomType): RoomTypeResource
    {
        return new RoomTypeResource($roomType->load(['hotel.location', 'images']));
    }

    public function update(Request $request, RoomType $roomType): RoomTypeResource
    {
        $roomType->update($this->validated($request));

        $this->cache->forgetHotel($roomType->hotel->slug);
        $this->cache->forgetRoomAvailability($roomType->id);

        return new RoomTypeResource($roomType->refresh()->load(['hotel.location', 'images']));
    }

    public function destroy(RoomType $roomType): JsonResponse
    {
        abort_if($roomType->bookings()->exists(), 422, 'Cannot delete a room type with bookings.');
        $hotelSlug = $roomType->hotel->slug;
        $roomTypeId = $roomType->id;
        $roomType->delete();

        $this->cache->forgetHotel($hotelSlug);
        $this->cache->forgetRoomAvailability($roomTypeId);

        return response()->json(['message' => 'Room type deleted.']);
    }

    public function uploadImages(Request $request, RoomType $roomType)
    {
        $request->validate([
            'images' => ['required', 'array'],
            'images.*' => ['image', 'max:4096'],
        ]);

        foreach ($request->file('images', []) as $index => $image) {
            HotelImage::create([
                'hotel_id' => $roomType->hotel_id,
                'room_type_id' => $roomType->id,
                'image_path' => $image->store('room-types', 'public'),
                'sort_order' => $roomType->images()->count() + $index,
            ]);
        }

        $this->cache->forgetHotel($roomType->hotel->slug);

        return new RoomTypeResource($roomType->refresh()->load('images'));
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'max_guests' => ['required', 'integer', 'min:1'],
            'bed_type' => ['required', 'string', 'max:255'],
            'size_sqm' => ['nullable', 'integer', 'min:1'],
            'price_per_night' => ['required', 'numeric', 'min:0'],
            'amenities' => ['nullable', 'array'],
            'total_rooms' => ['required', 'integer', 'min:1'],
        ]);
    }
}
