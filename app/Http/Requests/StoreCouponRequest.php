<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCouponRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'description' => ['nullable', 'string', 'max:500'],
            'discount_type' => ['required', 'in:percentage,fixed_amount'],
            'discount_value' => ['required', 'numeric', 'min:0'],
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