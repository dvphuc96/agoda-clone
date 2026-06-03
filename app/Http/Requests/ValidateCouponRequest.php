<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidateCouponRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
            'booking_value' => ['required', 'numeric', 'min:0'],
            'hotel_id' => ['nullable', 'integer', 'exists:hotels,id'],
        ];
    }
}