<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ValidateCouponRequest;
use App\Http\Resources\CouponResource;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;

class CouponController extends Controller
{
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