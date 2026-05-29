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

    public function index(Request $request)
    {
        $bookings = $request->user()
            ->bookings()
            ->with(['roomType.hotel.location', 'payments'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return BookingResource::collection($bookings);
    }

    public function store(StoreBookingRequest $request)
    {
        try {
            $booking = $this->bookingService->createBooking($request->user(), $request->validated());
            $booking->load(['roomType.hotel.location']);
            return response()->json(new BookingResource($booking), 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Request $request, string $bookingCode)
    {
        $booking = $request->user()
            ->bookings()
            ->where('booking_code', $bookingCode)
            ->with(['roomType.hotel.location', 'roomType.images', 'payments'])
            ->firstOrFail();

        return response()->json(new BookingResource($booking));
    }

    public function destroy(Request $request, string $bookingCode)
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
