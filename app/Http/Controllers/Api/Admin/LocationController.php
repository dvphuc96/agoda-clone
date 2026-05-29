<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        $query = Location::query()->withCount('hotels')->orderBy('name');

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->filled('region')) {
            $query->where('region', $request->region);
        }

        return LocationResource::collection($query->paginate((int) $request->input('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return response()->json(new LocationResource(Location::create($data)), 201);
    }

    public function show(Location $location): LocationResource
    {
        return new LocationResource($location->loadCount('hotels'));
    }

    public function update(Request $request, Location $location): LocationResource
    {
        $data = $this->validated($request, $location->id);
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $location->update($data);

        return new LocationResource($location->refresh()->loadCount('hotels'));
    }

    public function destroy(Location $location): JsonResponse
    {
        abort_if($location->hotels()->exists(), 422, 'Cannot delete a location with hotels.');
        $location->delete();

        return response()->json(['message' => 'Location deleted.']);
    }

    public function uploadImage(Request $request, Location $location): LocationResource
    {
        $request->validate(['image' => ['required', 'image', 'max:4096']]);
        $path = $request->file('image')->store('locations', 'public');

        if ($location->image) {
            Storage::disk('public')->delete($location->image);
        }

        $location->update(['image' => $path]);

        return new LocationResource($location->refresh()->loadCount('hotels'));
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $uniqueSlug = 'unique:locations,slug';
        if ($ignoreId) {
            $uniqueSlug .= ',' . $ignoreId;
        }

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', $uniqueSlug],
            'image' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'region' => ['required', 'string', 'max:255'],
        ]);
    }
}
