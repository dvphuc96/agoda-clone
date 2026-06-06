<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\HotelResource;
use App\Models\Hotel;
use App\Models\HotelImage;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class HotelController extends Controller
{
    public function __construct(
        private CacheService $cache,
    ) {}
    public function index(Request $request)
    {
        $query = Hotel::query()
            ->with(['location', 'images', 'roomTypes'])
            ->withMin('roomTypes', 'price_per_night')
            ->latest();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }
        if ($request->filled('location_id')) {
            $query->where('location_id', $request->location_id);
        }
        if ($request->filled('star_rating')) {
            $query->where('star_rating', $request->star_rating);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('min_price')) {
            $query->whereHas('roomTypes', fn ($q) => $q->where('price_per_night', '>=', $request->min_price));
        }
        if ($request->filled('max_price')) {
            $query->whereHas('roomTypes', fn ($q) => $q->where('price_per_night', '<=', $request->max_price));
        }

        return HotelResource::collection($query->paginate((int) $request->input('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $hotel = Hotel::create($data)->load(['location', 'images', 'roomTypes']);

        $this->cache->forget($this->cache->featuredHotelsKey());
        $this->cache->flushTag('search');

        return response()->json(new HotelResource($hotel), 201);
    }

    public function show(Hotel $hotel): HotelResource
    {
        return new HotelResource($hotel->load(['location', 'images', 'roomTypes.images']));
    }

    public function update(Request $request, Hotel $hotel): HotelResource
    {
        $data = $this->validated($request, $hotel->id);
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $hotel->update($data);

        $this->cache->forgetHotel($hotel->slug);

        return new HotelResource($hotel->refresh()->load(['location', 'images', 'roomTypes.images']));
    }

    public function destroy(Hotel $hotel): JsonResponse
    {
        abort_if($hotel->roomTypes()->whereHas('bookings')->exists(), 422, 'Cannot delete a hotel with bookings.');
        $slug = $hotel->slug;
        $hotel->delete();

        $this->cache->forgetHotel($slug);

        return response()->json(['message' => 'Hotel deleted.']);
    }

    public function toggleStatus(Hotel $hotel): HotelResource
    {
        $hotel->update(['status' => $hotel->status === 'active' ? 'inactive' : 'active']);

        $this->cache->forgetHotel($hotel->slug);

        return new HotelResource($hotel->refresh()->load(['location', 'images', 'roomTypes']));
    }

    public function uploadImages(Request $request, Hotel $hotel)
    {
        $request->validate([
            'images' => ['required', 'array'],
            'images.*' => ['image', 'max:4096'],
        ]);

        foreach ($request->file('images', []) as $index => $image) {
            HotelImage::create([
                'hotel_id' => $hotel->id,
                'image_path' => $image->store('hotels', 'public'),
                'sort_order' => $hotel->images()->count() + $index,
            ]);
        }

        $this->cache->forgetHotel($hotel->slug);

        return new HotelResource($hotel->refresh()->load(['location', 'images', 'roomTypes']));
    }

    public function destroyImage(HotelImage $image): JsonResponse
    {
        $hotelSlug = $image->hotel->slug ?? null;
        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        if ($hotelSlug) {
            $this->cache->forgetHotel($hotelSlug);
        }

        return response()->json(['message' => 'Image deleted.']);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $uniqueSlug = 'unique:hotels,slug';
        if ($ignoreId) {
            $uniqueSlug .= ',' . $ignoreId;
        }

        return $request->validate([
            'location_id' => ['required', 'exists:locations,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', $uniqueSlug],
            'property_type' => ['required', 'in:hotel,villa,resort,apartment'],
            'description' => ['nullable', 'string'],
            'address' => ['required', 'string', 'max:255'],
            'star_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'checkin_time' => ['required', 'date_format:H:i'],
            'checkout_time' => ['required', 'date_format:H:i'],
            'amenities' => ['nullable', 'array'],
            'status' => ['required', 'in:active,inactive'],
        ]);
    }
}
