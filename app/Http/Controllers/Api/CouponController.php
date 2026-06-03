<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ValidateCouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function available(Request $request): JsonResponse
    {
        $request->validate([
            'hotel_id' => 'nullable|integer|exists:hotels,id',
            'booking_value' => 'nullable|numeric|min:0',
        ]);

        $hotelId = $request->hotel_id;
        $bookingValue = (float) ($request->booking_value ?? 0);

        $coupons = Coupon::where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('expires_at', '>', now())
            ->where(function ($q) {
                $q->whereNull('max_uses')->orWhereRaw('used_count < max_uses');
            })
            ->when($hotelId, function ($q, $hotelId) {
                $q->where(function ($q2) use ($hotelId) {
                    $q2->whereNull('applicable_hotels')
                        ->orWhereJsonContains('applicable_hotels', $hotelId);
                });
            })
            ->when($bookingValue > 0, function ($q) use ($bookingValue) {
                $q->where(function ($q2) use ($bookingValue) {
                    $q2->whereNull('min_booking_value')
                        ->orWhere('min_booking_value', '<=', $bookingValue);
                });
            })
            ->orderByDesc('discount_value')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => CouponResource::collection($coupons),
        ]);
    }

    public function validate(ValidateCouponRequest $request, CouponService $couponService): JsonResponse
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            $coupon = $couponService->validateCoupon(
                $request->code,
                $user->id,
                (float) $request->booking_value,
                $request->hotel_id,
            );

            $discountAmount = $couponService->calculateDiscount(
                $coupon,
                (float) $request->booking_value,
            );

            return response()->json([
                'data' => [
                    'coupon' => new CouponResource($coupon),
                    'discount_amount' => $discountAmount,
                    'final_price' => (float) $request->booking_value - $discountAmount,
                ],
                'message' => 'Coupon is valid',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}