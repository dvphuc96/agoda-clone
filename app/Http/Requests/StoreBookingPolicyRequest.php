<?php

namespace App\Http\Requests;

use App\Models\RoomType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreBookingPolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'hotel_id' => 'required|exists:hotels,id',
            'room_type_id' => 'nullable|exists:room_types,id',
            'free_cancellation_hours' => 'required|integer|min:0',
            'cancellation_fee_percent' => 'required|numeric|min:0|max:100',
            'is_non_refundable' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $hotelId = $this->integer('hotel_id');
                $roomTypeId = $this->integer('room_type_id');

                if (!$hotelId || !$roomTypeId || $validator->errors()->has('hotel_id') || $validator->errors()->has('room_type_id')) {
                    return;
                }

                $belongsToHotel = RoomType::whereKey($roomTypeId)
                    ->where('hotel_id', $hotelId)
                    ->exists();

                if (!$belongsToHotel) {
                    $validator->errors()->add('room_type_id', 'The selected room type does not belong to the selected hotel.');
                }
            },
        ];
    }
}
