<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OccupancyDataResource;
use App\Http\Resources\RevenuePointResource;
use App\Http\Resources\TopHotelResource;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalyticsController extends Controller
{
    public function __construct(private AnalyticsService $analytics) {}

    public function revenue(Request $request): JsonResponse
    {
        $data = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'group_by' => ['sometimes', 'in:day,month'],
            'location_id' => ['sometimes', 'integer', 'exists:locations,id'],
            'hotel_id' => ['sometimes', 'integer', 'exists:hotels,id'],
        ]);

        $result = $this->analytics->revenueOverTime(
            startDate: $data['start_date'],
            endDate: $data['end_date'],
            groupBy: $data['group_by'] ?? 'day',
            locationId: $data['location_id'] ?? null,
            hotelId: $data['hotel_id'] ?? null,
        );

        return response()->json([
            'data' => RevenuePointResource::collection($result),
        ]);
    }

    public function occupancy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'hotel_id' => ['sometimes', 'integer', 'exists:hotels,id'],
            'room_type_id' => ['sometimes', 'integer', 'exists:room_types,id'],
        ]);

        $result = $this->analytics->occupancyRate(
            hotelId: $data['hotel_id'] ?? null,
            startDate: $data['start_date'],
            endDate: $data['end_date'],
            roomTypeId: $data['room_type_id'] ?? null,
        );

        return response()->json([
            'data' => OccupancyDataResource::collection($result),
        ]);
    }

    public function topHotels(Request $request): JsonResponse
    {
        $data = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $result = $this->analytics->topHotels(
            limit: $data['limit'] ?? 10,
            startDate: $data['start_date'],
            endDate: $data['end_date'],
        );

        return response()->json([
            'data' => TopHotelResource::collection($result),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $data = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $filename = 'revenue-' . $data['start_date'] . '-to-' . $data['end_date'] . '.csv';

        return response()->streamDownload(
            callback: fn () => print($this->analytics->exportRevenueCsv($data['start_date'], $data['end_date'])),
            name: $filename,
            headers: ['Content-Type' => 'text/csv'],
        );
    }
}
