<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingPolicy;
use App\Models\RoomType;
use Carbon\Carbon;

class BookingPolicyService
{
    public function getApplicablePolicy(RoomType $roomType): ?BookingPolicy
    {
        $policy = BookingPolicy::where('room_type_id', $roomType->id)
            ->where('is_active', true)
            ->first();

        if ($policy) {
            return $policy;
        }

        return BookingPolicy::where('hotel_id', $roomType->hotel_id)
            ->whereNull('room_type_id')
            ->where('is_active', true)
            ->first();
    }

    public function getCancellationEligibility(Booking $booking): array
    {
        $policy = $this->getApplicablePolicy($booking->roomType);

        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return [
                'can_cancel' => false,
                'reason' => 'Chi co the huy dat phong dang cho hoac da xac nhan',
            ];
        }

        if (!$policy) {
            return [
                'can_cancel' => true,
                'is_free' => true,
                'fee_amount' => 0,
                'refund_amount' => (float) $booking->total_price,
                'reason' => 'Khong co chinh sach huy dat phong - duoc huy mien phi',
                'policy' => null,
            ];
        }

        if ($policy->is_non_refundable) {
            return [
                'can_cancel' => true,
                'is_free' => false,
                'fee_amount' => (float) $booking->total_price,
                'refund_amount' => 0,
                'reason' => 'Chinh sach khong hoan tien',
                'policy' => $policy,
            ];
        }

        $hoursUntilCheckin = now()->diffInHours(Carbon::parse($booking->check_in), false);

        if ($hoursUntilCheckin >= $policy->free_cancellation_hours) {
            return [
                'can_cancel' => true,
                'is_free' => true,
                'fee_amount' => 0,
                'refund_amount' => (float) $booking->total_price,
                'reason' => 'Trong thoi gian huy mien phi',
                'policy' => $policy,
            ];
        }

        $feeAmount = round((float) $booking->total_price * ((float) $policy->cancellation_fee_percent / 100), 2);
        $refundAmount = round((float) $booking->total_price - $feeAmount, 2);

        return [
            'can_cancel' => true,
            'is_free' => false,
            'fee_amount' => $feeAmount,
            'refund_amount' => max(0, $refundAmount),
            'reason' => "Phi huy {$policy->cancellation_fee_percent}% - con {$hoursUntilCheckin} gio den check-in",
            'policy' => $policy,
        ];
    }

    public function calculateRefundAmount(Booking $booking): float
    {
        $eligibility = $this->getCancellationEligibility($booking);
        return $eligibility['refund_amount'];
    }

    public function isPendingExpired(Booking $booking, int $expiryMinutes = 30): bool
    {
        if ($booking->status !== 'pending') {
            return false;
        }

        return $booking->created_at->copy()->addMinutes($expiryMinutes)->isPast();
    }
}
