<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CancelBookingRequest;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use App\Services\CancellationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService,
        private CancellationService $cancellationService,
    ) {}

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
            $booking->load(['roomType.hotel.location', 'transferBookings.hotel.location', 'transferBookings.vehicleType', 'transferBookings.route']);
            return (new BookingResource($booking))
                ->response()
                ->setStatusCode(201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Request $request, string $bookingCode)
    {
        $booking = $request->user()
            ->bookings()
            ->where('booking_code', $bookingCode)
            ->with(['roomType.hotel.location', 'roomType.images', 'payments', 'refunds'])
            ->firstOrFail();

        return new BookingResource($booking);
    }

    public function cancelRequest(CancelBookingRequest $request, string $bookingCode)
    {
        $booking = $request->user()
            ->bookings()
            ->where('booking_code', $bookingCode)
            ->with(['roomType.hotel', 'payments'])
            ->firstOrFail();

        try {
            $result = $this->cancellationService->requestCancellation($booking, $request->user(), $request->reason);
            $booking->refresh()->load(['roomType.hotel.location', 'payments', 'refunds']);

            return response()->json([
                'message' => 'Yeu cau huy dat phong da duoc tao',
                'booking' => new BookingResource($booking),
                'refund' => new \App\Http\Resources\RefundResource($result['refund']),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
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
