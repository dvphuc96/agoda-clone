<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LoyaltyTransactionResource;
use App\Services\LoyaltyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    public function __construct(
        private LoyaltyService $loyaltyService,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $summary = $this->loyaltyService->getAccountSummary($request->user());

        return response()->json(['data' => $summary]);
    }

    public function transactions(Request $request)
    {
        $transactions = $this->loyaltyService->getTransactions($request->user());

        return LoyaltyTransactionResource::collection($transactions);
    }

    public function redeem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'points' => 'required|integer|min:1',
        ]);

        $transaction = $this->loyaltyService->redeemPoints($request->user(), $data['points']);

        return response()->json([
            'message' => 'Points redeemed successfully.',
            'data' => new LoyaltyTransactionResource($transaction),
        ]);
    }
}
