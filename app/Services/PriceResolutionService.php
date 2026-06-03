<?php

namespace App\Services;

use App\Models\PriceOverride;
use App\Models\RoomType;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class PriceResolutionService
{
    public function resolveTotalPrice(RoomType $roomType, string $checkIn, string $checkOut): array
    {
        $start = Carbon::parse($checkIn);
        $end = Carbon::parse($checkOut);
        $nights = $start->diffInDays($end);

        $overrides = PriceOverride::where('room_type_id', $roomType->id)
            ->where('is_active', true)
            ->where('start_date', '<', $end->format('Y-m-d'))
            ->where('end_date', '>=', $start->format('Y-m-d'))
            ->get();

        $total = 0;
        $breakdown = [];
        $period = CarbonPeriod::create($start, $end->copy()->subDay());

        foreach ($period as $night) {
            $nightStr = $night->format('Y-m-d');
            $override = $overrides->first(
                fn(PriceOverride $o) => $nightStr >= $o->start_date->format('Y-m-d')
                    && $nightStr <= $o->end_date->format('Y-m-d')
            );

            $price = $override ? (float) $override->price_per_night : (float) $roomType->price_per_night;
            $total += $price;

            $key = (string) $price;
            if (! isset($breakdown[$key])) {
                $breakdown[$key] = ['price' => $price, 'nights' => 0, 'label' => $override?->label];
            }
            $breakdown[$key]['nights']++;
        }

        return [
            'total' => round($total, 2),
            'nights' => $nights,
            'breakdown' => array_values($breakdown),
            'average_per_night' => $nights > 0 ? round($total / $nights, 2) : 0,
        ];
    }

    public function resolveNightPrice(RoomType $roomType, string $date): float
    {
        $override = PriceOverride::where('room_type_id', $roomType->id)
            ->where('is_active', true)
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->first();

        return $override ? (float) $override->price_per_night : (float) $roomType->price_per_night;
    }
}
