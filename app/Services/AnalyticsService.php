<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Hotel;
use App\Models\Payment;
use App\Models\RoomType;
use Carbon\CarbonPeriod;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Revenue over time aggregated from successful payments.
     *
     * @return array<int, array{date: string, revenue: float, booking_count: int}>
     */
    public function revenueOverTime(string $startDate, string $endDate, string $groupBy = 'day', ?int $locationId = null, ?int $hotelId = null): array
    {
        $dateFormat = $groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

        $query = Payment::query()
            ->selectRaw("DATE_FORMAT(paid_at, '{$dateFormat}') as period")
            ->selectRaw('SUM(amount) as revenue')
            ->selectRaw('COUNT(DISTINCT booking_id) as booking_count')
            ->where('status', 'success')
            ->whereBetween('paid_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->groupBy('period')
            ->orderBy('period');

        if ($locationId || $hotelId) {
            $query->whereHas('booking.roomType.hotel', function ($q) use ($locationId, $hotelId) {
                if ($locationId) {
                    $q->where('location_id', $locationId);
                }
                if ($hotelId) {
                    $q->where('id', $hotelId);
                }
            });
        }

        $rows = $query->get()->keyBy('period');

        $period = $groupBy === 'month'
            ? CarbonPeriod::create(Carbon::parse($startDate)->startOfMonth(), '1 month', Carbon::parse($endDate)->startOfMonth())
            : CarbonPeriod::create($startDate, $endDate);

        return collect($period)->map(function (Carbon $date) use ($rows, $groupBy) {
            $key = $groupBy === 'month' ? $date->format('Y-m') : $date->format('Y-m-d');

            return [
                'date' => $key,
                'revenue' => (float) ($rows[$key]->revenue ?? 0),
                'booking_count' => (int) ($rows[$key]->booking_count ?? 0),
            ];
        })->values()->all();
    }

    /**
     * Occupancy rate per day for a given hotel (or all hotels).
     *
     * @return array<int, array{date: string, total_rooms: int, booked_rooms: int, rate: float}>
     */
    public function occupancyRate(?int $hotelId, string $startDate, string $endDate, ?int $roomTypeId = null): array
    {
        $hotelIds = $hotelId
            ? [$hotelId]
            : Hotel::where('status', 'active')->pluck('id')->toArray();

        $roomTypeQuery = RoomType::whereIn('hotel_id', $hotelIds);
        if ($roomTypeId) {
            $roomTypeQuery->where('id', $roomTypeId);
        }

        $roomTypes = $roomTypeQuery->get();
        $totalRooms = $roomTypes->sum('total_rooms');

        if ($totalRooms === 0) {
            return [];
        }

        $roomTypeIds = $roomTypes->pluck('id')->toArray();

        // Get all active bookings overlapping the date range
        $bookings = Booking::whereIn('room_type_id', $roomTypeIds)
            ->where('status', '!=', 'cancelled')
            ->where('check_in', '<=', $endDate)
            ->where('check_out', '>', $startDate)
            ->get();

        $result = [];
        $period = CarbonPeriod::create($startDate, $endDate);

        foreach ($period as $date) {
            $dateStr = $date->format('Y-m-d');
            $bookedRooms = 0;

            foreach ($bookings as $booking) {
                if ($date->gte($booking->check_in) && $date->lt($booking->check_out)) {
                    $bookedRooms++;
                }
            }

            $rate = $totalRooms > 0 ? round(($bookedRooms / $totalRooms) * 100, 2) : 0;

            $result[] = [
                'date' => $dateStr,
                'total_rooms' => $totalRooms,
                'booked_rooms' => $bookedRooms,
                'rate' => $rate,
            ];
        }

        return $result;
    }

    /**
     * Top hotels ranked by revenue in a given period.
     *
     * @return array<int, array{hotel: array{id: int, name: string, slug: string}, revenue: float, bookings: int, avg_rating: float|null}>
     */
    public function topHotels(int $limit, string $startDate, string $endDate): array
    {
        $rows = Payment::query()
            ->select('hotel_id')
            ->selectRaw('SUM(payments.amount) as revenue')
            ->selectRaw('COUNT(DISTINCT payments.booking_id) as bookings')
            ->join('bookings', 'payments.booking_id', '=', 'bookings.id')
            ->join('room_types', 'bookings.room_type_id', '=', 'room_types.id')
            ->where('payments.status', 'success')
            ->whereBetween('payments.paid_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->groupBy('hotel_id')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get();

        $hotelIds = $rows->pluck('hotel_id')->toArray();
        $hotels = Hotel::whereIn('id', $hotelIds)->get()->keyBy('id');

        // Pre-load avg ratings
        $ratings = DB::table('reviews')
            ->select('hotel_id', DB::raw('AVG(rating) as avg_rating'))
            ->where('status', 'approved')
            ->whereIn('hotel_id', $hotelIds)
            ->groupBy('hotel_id')
            ->pluck('avg_rating', 'hotel_id');

        return $rows->map(function ($row) use ($hotels, $ratings) {
            $hotel = $hotels->get($row->hotel_id);

            return [
                'hotel' => $hotel ? [
                    'id' => $hotel->id,
                    'name' => $hotel->name,
                    'slug' => $hotel->slug,
                ] : null,
                'revenue' => (float) $row->revenue,
                'bookings' => (int) $row->bookings,
                'avg_rating' => isset($ratings[$row->hotel_id]) ? round((float) $ratings[$row->hotel_id], 1) : null,
            ];
        })->filter(fn ($item) => $item['hotel'] !== null)->values()->all();
    }

    /**
     * Generate CSV string for revenue export.
     */
    public function exportRevenueCsv(string $startDate, string $endDate): string
    {
        $data = $this->revenueOverTime($startDate, $endDate, 'day');

        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, ['Date', 'Revenue', 'Bookings']);

        foreach ($data as $row) {
            fputcsv($handle, [$row['date'], $row['revenue'], $row['booking_count']]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return $csv;
    }
}
