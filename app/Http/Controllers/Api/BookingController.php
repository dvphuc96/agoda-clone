<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(private BookingService $bookingService) {}

    public function index(Request $request): JsonResponse
    {
        $bookings = $request->user()
            ->bookings()
            ->with(['roomType.hotel.destination', 'payments'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json(BookingResource::collection($bookings));
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        try {
            $booking = $this->bookingService->createBooking($request->user(), $request->validated());
            $booking->load(['roomType.hotel.destination']);
            return response()->json(new BookingResource($booking), 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Request $request, string $bookingCode): JsonResponse
    {
        $booking = $request->user()
            ->bookings()
            ->where('booking_code', $bookingCode)
            ->with(['roomType.hotel.destination', 'roomType.images', 'payments'])
            ->firstOrFail();

        return response()->json(new BookingResource($booking));
    }

    public function destroy(Request $request, string $bookingCode): JsonResponse
    {
        $booking = $request->user()
            ->bookings()
            ->where('booking_code', $bookingCode)
            ->firstOrFail();

        try {
            $this->bookingService->cancelBooking($booking);
            return response()->json(['message' => 'Huy dat phong thanh cong']);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
