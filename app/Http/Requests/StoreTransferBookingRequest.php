<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransferBookingRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'transfer_route_id' => ['required', 'exists:transfer_routes,id'],
            'pickup_datetime' => ['required', 'date', 'after:now'],
            'passengers' => ['required', 'integer', 'min:1'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:30'],
            'flight_number' => ['nullable', 'string', 'max:50'],
            'special_requests' => ['nullable', 'string', 'max:500'],
        ];
    }
}
