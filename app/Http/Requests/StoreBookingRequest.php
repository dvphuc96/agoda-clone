<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'room_type_id' => ['required', 'exists:room_types,id'],
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1'],
            'special_requests' => ['nullable', 'string', 'max:500'],
            'transfer_add_on' => ['nullable', 'array'],
            'transfer_add_on.transfer_route_id' => ['required_with:transfer_add_on', 'exists:transfer_routes,id'],
            'transfer_add_on.pickup_datetime' => ['required_with:transfer_add_on', 'date', 'after:now'],
            'transfer_add_on.contact_name' => ['required_with:transfer_add_on', 'string', 'max:255'],
            'transfer_add_on.contact_phone' => ['required_with:transfer_add_on', 'string', 'max:30'],
            'transfer_add_on.flight_number' => ['nullable', 'string', 'max:50'],
            'transfer_add_on.special_requests' => ['nullable', 'string', 'max:500'],
        ];
    }
}
