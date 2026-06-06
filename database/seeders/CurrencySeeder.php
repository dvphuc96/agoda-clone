<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        $currencies = [
            [
                'code' => 'VND',
                'name' => 'Vietnamese Dong',
                'symbol' => '₫',
                'exchange_rate' => 1.000000,
                'decimal_places' => 0,
                'symbol_position' => 'after',
                'thousand_separator' => '.',
                'decimal_separator' => ',',
            ],
            [
                'code' => 'USD',
                'name' => 'US Dollar',
                'symbol' => '$',
                'exchange_rate' => 0.000039,
                'decimal_places' => 2,
                'symbol_position' => 'before',
                'thousand_separator' => ',',
                'decimal_separator' => '.',
            ],
            [
                'code' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
                'exchange_rate' => 0.000036,
                'decimal_places' => 2,
                'symbol_position' => 'before',
                'thousand_separator' => ',',
                'decimal_separator' => '.',
            ],
            [
                'code' => 'KRW',
                'name' => 'South Korean Won',
                'symbol' => '₩',
                'exchange_rate' => 0.052000,
                'decimal_places' => 0,
                'symbol_position' => 'before',
                'thousand_separator' => ',',
                'decimal_separator' => '.',
            ],
            [
                'code' => 'JPY',
                'name' => 'Japanese Yen',
                'symbol' => '¥',
                'exchange_rate' => 0.005900,
                'decimal_places' => 0,
                'symbol_position' => 'before',
                'thousand_separator' => ',',
                'decimal_separator' => '.',
            ],
        ];

        foreach ($currencies as $currency) {
            Currency::create($currency);
        }
    }
}
