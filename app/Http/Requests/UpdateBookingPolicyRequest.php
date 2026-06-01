<?php

namespace App\Http\Requests;

use App\Models\BookingPolicy;
use App\Models\RoomType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateBookingPolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'hotel_id' => 'sometimes|exists:hotels,id',
            'room_type_id' => 'nullable|exists:room_types,id',
            'free_cancellation_hours' => 'sometimes|integer|min:0',
            'cancellation_fee_percent' => 'sometimes|numeric|min:0|max:100',
            'is_non_refundable' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var BookingPolicy|null $policy */
                $policy = $this->route('bookingPolicy');
                $hotelId = $this->has('hotel_id') ? $this->integer('hotel_id') : $policy?->hotel_id;
                $roomTypeId = $this->has('room_type_id') ? $this->integer('room_type_id') : $policy?->room_type_id;

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
