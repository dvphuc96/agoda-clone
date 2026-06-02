<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCouponRequest extends FormRequest
{
    public function rules(): array
    {
        $couponId = $this->route('coupon')->id ?? $this->route('coupon');

        return [
            'code' => ['sometimes', 'string', 'max:50', 'unique:coupons,code,'.$couponId],
            'description' => ['nullable', 'string', 'max:500'],
            'discount_type' => ['sometimes', 'in:percentage,fixed_amount'],
            'discount_value' => ['sometimes', 'numeric', 'min:0'],
            'min_booking_value' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'max_uses_per_user' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date', 'after_or_equal:today'],
            'expires_at' => ['nullable', 'date', 'after:starts_at'],
            'is_active' => ['boolean'],
            'applicable_hotels' => ['nullable', 'array'],
            'applicable_hotels.*' => ['integer', 'exists:hotels,id'],
        ];
    }
}