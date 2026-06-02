<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingModificationResource;
use App\Models\BookingModification;
use App\Services\BookingModificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingModificationController extends Controller
{
    public function __construct(
        private BookingModificationService $modificationService,
    ) {}

    public function index(Request $request)
    {
        $query = BookingModification::with(['booking.roomType.hotel', 'user']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $modifications = $query->orderBy('created_at', 'desc')->paginate(15);

        return BookingModificationResource::collection($modifications);
    }

    public function show(BookingModification $modification): BookingModificationResource
    {
        $modification->load(['booking.roomType.hotel.location', 'user']);

        return new BookingModificationResource($modification);
    }

    public function approve(Request $request, BookingModification $modification): JsonResponse
    {
        $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $booking = $this->modificationService->approveModification(
                $modification,
                $request->input('admin_notes')
            );

            $modification->refresh()->load(['booking.roomType.hotel.location', 'user']);

            return response()->json([
                'message' => 'Yeu cau thay doi da duoc duyet',
                'modification' => new BookingModificationResource($modification),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reject(Request $request, BookingModification $modification): JsonResponse
    {
        $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->modificationService->rejectModification(
                $modification,
                $request->input('admin_notes')
            );

            $modification->refresh()->load(['booking.roomType.hotel.location', 'user']);

            return response()->json([
                'message' => 'Yeu cau thay doi da bi tu choi',
                'modification' => new BookingModificationResource($modification),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
