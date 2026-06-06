<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['code', 'name', 'symbol', 'exchange_rate', 'decimal_places', 'symbol_position', 'thousand_separator', 'decimal_separator', 'is_active'])]
class Currency extends Model
{
    protected function casts(): array
    {
        return [
            'exchange_rate' => 'decimal:6',
            'decimal_places' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
