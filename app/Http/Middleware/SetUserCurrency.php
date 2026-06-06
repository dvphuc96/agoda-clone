<?php

namespace App\Http\Middleware;

use App\Services\CurrencyService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetUserCurrency
{
    public function __construct(
        private CurrencyService $currencyService,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $currency = $this->currencyService->getUserCurrency($request);

        app()->singleton('currency', fn () => $currency);

        return $next($request);
    }
}
