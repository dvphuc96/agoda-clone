<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePriceAlertRequest;
use App\Http\Resources\PriceAlertResource;
use App\Models\PriceAlert;
use App\Services\PriceAlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class PriceAlertController extends Controller
{
    public function __construct(
        private PriceAlertService $priceAlertService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $alerts = $this->priceAlertService->getUserAlerts(auth()->user());

        return PriceAlertResource::collection($alerts);
    }

    public function store(StorePriceAlertRequest $request): JsonResponse
    {
        try {
            $alert = $this->priceAlertService->createAlert(
                auth()->user(),
                \App\Models\Hotel::findOrFail($request->hotel_id),
                (float) $request->target_price,
            );

            return response()->json([
                'data' => new PriceAlertResource($alert->load('hotel')),
            ], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return response()->json([
                    'message' => 'Bạn đã đặt cảnh báo giá cho khách sạn này rồi.',
                ], 409);
            }
            throw $e;
        }
    }

    public function update(int $id): JsonResponse
    {
        $alert = PriceAlert::where('user_id', auth()->id())->findOrFail($id);
        $alert = $this->priceAlertService->toggleAlert($alert);

        return response()->json([
            'data' => new PriceAlertResource($alert->load('hotel')),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $alert = PriceAlert::where('user_id', auth()->id())->findOrFail($id);
        $this->priceAlertService->deleteAlert($alert);

        return response()->json(['message' => 'Đã xóa cảnh báo giá.']);
    }
}
