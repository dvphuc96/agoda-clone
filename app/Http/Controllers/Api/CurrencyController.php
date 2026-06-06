<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CurrencyResource;
use App\Services\CurrencyService;

class CurrencyController extends Controller
{
    public function __construct(
        private CurrencyService $currencyService,
    ) {}

    public function index()
    {
        $currencies = $this->currencyService->getActiveCurrencies();

        return CurrencyResource::collection($currencies);
    }
}
