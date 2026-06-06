<?php

namespace App\Services;

use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class CurrencyService
{
    public function __construct(
        private CacheService $cacheService,
    ) {}

    public function convert(float $amountVND, string $toCurrency): float
    {
        if ($toCurrency === 'VND') {
            return $amountVND;
        }

        $rate = $this->getRate($toCurrency);

        return round($amountVND * $rate, $this->getDecimalPlaces($toCurrency));
    }

    public function getRate(string $currency): float
    {
        if ($currency === 'VND') {
            return 1.0;
        }

        $key = 'gostay:currency:rate:' . $currency;

        return $this->cacheService->remember($key, 21600, function () use ($currency) {
            $model = Currency::where('code', $currency)->where('is_active', true)->first();
            return $model ? (float) $model->exchange_rate : 1.0;
        });
    }

    public function getActiveCurrencies(): Collection
    {
        return $this->cacheService->remember('gostay:currency:active', 21600, function () {
            return Currency::where('is_active', true)->orderBy('code')->get();
        });
    }

    public function format(float $amountVND, string $currency = 'VND'): string
    {
        $converted = $this->convert($amountVND, $currency);

        $currencyModel = $this->getActiveCurrencies()->firstWhere('code', $currency);

        if (!$currencyModel) {
            return number_format($converted, 0, '.', ',');
        }

        $formatted = number_format(
            $converted,
            $currencyModel->decimal_places,
            $currencyModel->decimal_separator,
            $currencyModel->thousand_separator,
        );

        return $currencyModel->symbol_position === 'before'
            ? $currencyModel->symbol . $formatted
            : $formatted . $currencyModel->symbol;
    }

    public function getUserCurrency(Request $request): string
    {
        $currency = $request->query('currency');

        if ($currency && $this->isValidCurrency($currency)) {
            return strtoupper($currency);
        }

        $user = $request->user();
        if ($user && $user->preferred_currency) {
            return $user->preferred_currency;
        }

        return 'VND';
    }

    public function isValidCurrency(string $code): bool
    {
        return $this->getActiveCurrencies()
            ->contains('code', strtoupper($code));
    }

    private function getDecimalPlaces(string $currency): int
    {
        if ($currency === 'VND') {
            return 0;
        }

        $currencyModel = $this->getActiveCurrencies()->firstWhere('code', $currency);

        return $currencyModel ? $currencyModel->decimal_places : 2;
    }
}
