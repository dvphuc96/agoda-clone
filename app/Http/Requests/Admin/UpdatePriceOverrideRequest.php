<?php

namespace App\Http\Requests\Admin;

use App\Models\PriceOverride;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePriceOverrideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['required', 'date', 'before_or_equal:end_date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'price_per_night' => ['required', 'numeric', 'gt:0'],
            'label' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $override = $this->route('price_override');

            if (PriceOverride::hasOverlappingRange(
                (int) $override->room_type_id,
                $this->start_date,
                $this->end_date,
                $override->id
            )) {
                $validator->errors()->add('start_date', 'Khoảng ngày này bị trùng với một override đã tồn tại.');
            }
        });
    }
}
