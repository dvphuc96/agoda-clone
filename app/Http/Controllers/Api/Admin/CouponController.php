<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCouponRequest;
use App\Http\Requests\UpdateCouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Coupon::query();

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $coupons = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json($coupons);
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        $coupon = Coupon::create([
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'min_booking_value' => $request->min_booking_value,
            'max_uses' => $request->max_uses,
            'max_uses_per_user' => $request->max_uses_per_user ?? 1,
            'starts_at' => $request->starts_at,
            'expires_at' => $request->expires_at,
            'is_active' => $request->is_active ?? true,
            'applicable_hotels' => $request->applicable_hotels,
        ]);

        return response()->json([
            'data' => new CouponResource($coupon),
            'message' => 'Coupon created successfully',
        ], 201);
    }

    public function show(Coupon $coupon): JsonResponse
    {
        $coupon->load('usages.user', 'usages.booking');

        return response()->json([
            'data' => new CouponResource($coupon),
        ]);
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon): JsonResponse
    {
        $data = array_filter([
            'code' => $request->has('code') ? strtoupper($request->code) : null,
            'description' => $request->filled('description') ? $request->description : null,
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'min_booking_value' => $request->min_booking_value,
            'max_uses' => $request->max_uses,
            'max_uses_per_user' => $request->max_uses_per_user,
            'starts_at' => $request->starts_at,
            'expires_at' => $request->expires_at,
            'is_active' => $request->filled('is_active') ? $request->boolean('is_active') : null,
            'applicable_hotels' => $request->applicable_hotels,
        ], fn ($value) => $value !== null);

        $coupon->update($data);

        return response()->json([
            'data' => new CouponResource($coupon),
            'message' => 'Coupon updated successfully',
        ]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $usageCount = $coupon->usages()->count();

        if ($usageCount > 0) {
            return response()->json([
                'message' => 'Cannot delete coupon that has been used',
            ], 422);
        }

        $coupon->delete();

        return response()->json([
            'message' => 'Coupon deleted successfully',
        ]);
    }

    public function toggleActive(Coupon $coupon): JsonResponse
    {
        $coupon->update([
            'is_active' => ! $coupon->is_active,
        ]);

        return response()->json([
            'data' => new CouponResource($coupon),
            'message' => "Coupon " . ($coupon->is_active ? 'activated' : 'deactivated') . ' successfully',
        ]);
    }
}