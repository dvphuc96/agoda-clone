<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RequestBookingModificationRequest;
use App\Http\Resources\BookingModificationResource;
use App\Services\BookingModificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingModificationController extends Controller
{
    public function __construct(
        private BookingModificationService $modificationService,
    ) {}

    public function store(RequestBookingModificationRequest $request, string $bookingCode): JsonResponse
    {
        $booking = $request->user()
            ->bookings()
            ->where('booking_code', $bookingCode)
            ->with('roomType')
            ->firstOrFail();

        try {
            $modification = $this->modificationService->requestModification(
                $booking,
                $request->user(),
                $request->validated()
            );

            $modification->load(['booking.roomType.hotel.location', 'user']);

            return (new BookingModificationResource($modification))
                ->response()
                ->setStatusCode(201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function index(Request $request, string $bookingCode)
    {
        $booking = $request->user()
            ->bookings()
            ->where('booking_code', $bookingCode)
            ->firstOrFail();

        $modifications = $booking->modifications()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return BookingModificationResource::collection($modifications);
    }
}
