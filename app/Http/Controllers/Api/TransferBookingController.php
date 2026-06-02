<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransferBookingRequest;
use App\Http\Resources\TransferBookingResource;
use App\Services\TransferBookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransferBookingController extends Controller
{
    public function __construct(private TransferBookingService $transferBookingService) {}

    public function index(Request $request)
    {
        $bookings = $request->user()
            ->transferBookings()
            ->with(['hotel.location', 'vehicleType', 'route'])
            ->latest()
            ->paginate(10);

        return TransferBookingResource::collection($bookings);
    }

    public function store(StoreTransferBookingRequest $request): JsonResponse
    {
        try {
            $booking = $this->transferBookingService->createBooking($request->user(), $request->validated());
            $booking->load(['hotel.location', 'vehicleType', 'route']);

            return (new TransferBookingResource($booking))
                ->response()
                ->setStatusCode(201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Request $request, string $bookingCode): TransferBookingResource
    {
        $booking = $request->user()
            ->transferBookings()
            ->where('booking_code', $bookingCode)
            ->with(['hotel.location', 'vehicleType', 'route'])
            ->firstOrFail();

        return new TransferBookingResource($booking);
    }

    public function cancel(Request $request, string $bookingCode): JsonResponse
    {
        $booking = $request->user()
            ->transferBookings()
            ->where('booking_code', $bookingCode)
            ->firstOrFail();

        try {
            $this->transferBookingService->cancelBooking($booking);
            $booking->refresh()->load(['hotel.location', 'vehicleType', 'route']);

            return response()->json([
                'message' => 'Huy don xe thanh cong',
                'booking' => new TransferBookingResource($booking),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
