<?php

namespace App\Http\Resources;

use App\Services\BookingPolicyService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $cancellation = null;
        if ($this->relationLoaded('roomType') && $this->roomType) {
            $policyService = app(BookingPolicyService::class);
            $eligibility = $policyService->getCancellationEligibility($this->resource);
            $policy = $eligibility['policy'] ?? null;

            $cancellation = [
                'can_cancel' => $eligibility['can_cancel'],
                'is_free' => $eligibility['is_free'] ?? null,
                'fee_amount' => $eligibility['fee_amount'] ?? null,
                'refund_amount' => $eligibility['refund_amount'] ?? null,
                'reason' => $eligibility['reason'] ?? null,
                'policy' => $policy ? [
                    'name' => $policy->name,
                    'free_cancellation_hours' => $policy->free_cancellation_hours,
                    'cancellation_fee_percent' => (float) $policy->cancellation_fee_percent,
                    'is_non_refundable' => $policy->is_non_refundable,
                ] : null,
            ];
        }

        return [
            'id' => $this->id,
            'booking_code' => $this->booking_code,
            'check_in' => $this->check_in->format('Y-m-d'),
            'check_out' => $this->check_out->format('Y-m-d'),
            'guests' => $this->guests,
            'special_requests' => $this->special_requests,
            'total_price' => $this->total_price,
            'discount_amount' => (float) ($this->discount_amount ?? 0),
            'status' => $this->status,
            'expires_at' => $this->expires_at?->format('Y-m-d H:i:s'),
            'remaining_seconds' => $this->remaining_seconds,
            'nights' => $this->check_in->diffInDays($this->check_out),
            'cancellation' => $cancellation,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
                'role' => $this->user->role,
            ]),
            'room_type' => new RoomTypeResource($this->whenLoaded('roomType')),
            'coupon' => CouponResource::make($this->whenLoaded('coupon')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'refunds' => RefundResource::collection($this->whenLoaded('refunds')),
            'transfer_bookings' => TransferBookingResource::collection($this->whenLoaded('transferBookings')),
            'modifications' => BookingModificationResource::collection($this->whenLoaded('modifications')),
            'modified_at' => $this->modified_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
