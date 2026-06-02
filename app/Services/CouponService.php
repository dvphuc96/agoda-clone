<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CouponService
{
    public function validateCoupon(string $code, int $userId, float $bookingValue, ?int $hotelId = null): Coupon
    {
        $coupon = Coupon::where('code', strtoupper($code))->first();

        if (! $coupon) {
            throw new \InvalidArgumentException('Coupon code not found');
        }

        if (! $coupon->isActive()) {
            throw new \InvalidArgumentException('Coupon is not active or has expired');
        }

        if ($coupon->min_booking_value && $bookingValue < $coupon->min_booking_value) {
            throw new \InvalidArgumentException('Minimum booking value not met');
        }

        if (! $coupon->canBeUsedByUser($userId, $hotelId)) {
            throw new \InvalidArgumentException('Coupon cannot be used by this user or for this hotel');
        }

        return $coupon;
    }

    public function calculateDiscount(Coupon $coupon, float $total): float
    {
        if ($coupon->discount_type === 'percentage') {
            $discount = ($total * $coupon->discount_value) / 100;

            return min($discount, $total);
        }

        return min($coupon->discount_value, $total);
    }

    public function applyCoupon(Coupon $coupon, Booking $booking, float $discountAmount): void
    {
        DB::transaction(function () use ($coupon, $booking, $discountAmount) {
            $coupon->increment('used_count');

            $booking->update([
                'coupon_id' => $coupon->id,
                'discount_amount' => $discountAmount,
            ]);

            CouponUsage::create([
                'coupon_id' => $coupon->id,
                'user_id' => $booking->user_id,
                'booking_id' => $booking->id,
            ]);
        });
    }

    public function removeCoupon(Booking $booking): void
    {
        DB::transaction(function () use ($booking) {
            if (! $booking->coupon_id) {
                return;
            }

            $usage = CouponUsage::where('booking_id', $booking->id)->first();

            if ($usage) {
                $usage->coupon->decrement('used_count');
                $usage->delete();
            }

            $booking->update([
                'coupon_id' => null,
                'discount_amount' => 0,
            ]);
        });
    }
}