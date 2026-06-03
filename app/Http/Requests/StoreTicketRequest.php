<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject' => ['required', 'string', 'max:200'],
            'category' => ['required', 'in:booking,payment,hotel,transfer,other'],
            'booking_code' => ['nullable', 'string', 'max:20'],
            'message' => ['required', 'string', 'max:5000'],
        ];
    }
}
