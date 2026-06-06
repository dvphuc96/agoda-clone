<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CurrencyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'code' => $this->code,
            'name' => $this->name,
            'symbol' => $this->symbol,
            'exchange_rate' => (float) $this->exchange_rate,
            'decimal_places' => $this->decimal_places,
            'symbol_position' => $this->symbol_position,
            'thousand_separator' => $this->thousand_separator,
            'decimal_separator' => $this->decimal_separator,
        ];
    }
}
