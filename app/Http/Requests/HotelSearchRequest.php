<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HotelSearchRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'location' => ['nullable', 'string'],
            'check_in' => ['nullable', 'date', 'after_or_equal:today'],
            'check_out' => ['nullable', 'date', 'after:check_in'],
            'guests' => ['nullable', 'integer', 'min:1'],
            'star' => ['nullable', 'integer', 'between:1,5'],
            'price_min' => ['nullable', 'numeric', 'min:0'],
            'price_max' => ['nullable', 'numeric', Rule::when($this->filled('price_min'), 'gt:price_min')],
            'types' => ['nullable', 'string'],
            'amenities' => ['nullable', 'string'],
            'sort' => ['nullable', 'in:popular,price_asc,price_desc,rating'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
