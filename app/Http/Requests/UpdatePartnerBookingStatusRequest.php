<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePartnerBookingStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|string|in:confirmed,cancelled',
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Only confirmed or cancelled status is allowed.',
        ];
    }
}
