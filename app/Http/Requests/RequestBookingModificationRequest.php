<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RequestBookingModificationRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'new_check_in' => ['required', 'date', 'after_or_equal:today'],
            'new_check_out' => ['required', 'date', 'after:new_check_in'],
            'new_guests' => ['required', 'integer', 'min:1'],
        ];
    }
}
