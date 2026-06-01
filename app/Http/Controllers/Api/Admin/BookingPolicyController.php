<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingPolicyRequest;
use App\Http\Requests\UpdateBookingPolicyRequest;
use App\Http\Resources\BookingPolicyResource;
use App\Models\BookingPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingPolicyController extends Controller
{
    public function index(Request $request)
    {
        $query = BookingPolicy::query()->with(['hotel', 'roomType'])->latest();

        if ($request->filled('hotel_id')) {
            $query->where('hotel_id', $request->hotel_id);
        }
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return BookingPolicyResource::collection($query->paginate((int) $request->input('per_page', 15)));
    }

    public function store(StoreBookingPolicyRequest $request): BookingPolicyResource
    {
        $policy = BookingPolicy::create($request->validated());
        $policy->load(['hotel', 'roomType']);

        return new BookingPolicyResource($policy);
    }

    public function show(BookingPolicy $bookingPolicy): BookingPolicyResource
    {
        return new BookingPolicyResource($bookingPolicy->load(['hotel', 'roomType']));
    }

    public function update(UpdateBookingPolicyRequest $request, BookingPolicy $bookingPolicy): BookingPolicyResource
    {
        $bookingPolicy->update($request->validated());
        $bookingPolicy->load(['hotel', 'roomType']);

        return new BookingPolicyResource($bookingPolicy);
    }

    public function destroy(BookingPolicy $bookingPolicy): JsonResponse
    {
        $bookingPolicy->delete();
        return response()->json(['message' => 'Xoa chinh sach thanh cong']);
    }
}
