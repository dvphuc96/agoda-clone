<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateRefundStatusRequest;
use App\Http\Resources\RefundResource;
use App\Models\Refund;
use App\Services\RefundService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RefundController extends Controller
{
    public function __construct(private RefundService $refundService) {}

    public function index(Request $request)
    {
        $query = Refund::query()
            ->with(['booking.roomType.hotel', 'requester', 'processor'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('booking_id')) {
            $query->where('booking_id', $request->booking_id);
        }

        return RefundResource::collection($query->paginate((int) $request->input('per_page', 15)));
    }

    public function show(Refund $refund): RefundResource
    {
        return new RefundResource($refund->load(['booking.roomType.hotel', 'payment', 'requester', 'processor']));
    }

    public function updateStatus(UpdateRefundStatusRequest $request, Refund $refund): RefundResource|JsonResponse
    {
        try {
            $refund = match ($request->status) {
                'approved' => $this->refundService->approve($refund, $request->user(), $request->admin_notes),
                'rejected' => $this->refundService->reject($refund, $request->user(), $request->admin_notes),
                'processed' => $this->refundService->markProcessed($refund, $request->user(), $request->admin_notes),
            };

            return new RefundResource($refund->load(['booking.roomType.hotel', 'payment', 'requester', 'processor']));
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
