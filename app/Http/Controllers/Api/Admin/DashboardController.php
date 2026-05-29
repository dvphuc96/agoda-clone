<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Hotel;
use App\Models\User;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $today = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();
        $monthStart = Carbon::now()->startOfMonth();

        return response()->json([
            'bookings' => [
                'today' => Booking::whereDate('created_at', $today)->count(),
                'week' => Booking::where('created_at', '>=', $weekStart)->count(),
                'month' => Booking::where('created_at', '>=', $monthStart)->count(),
            ],
            'revenue' => [
                'today' => (float) Booking::whereDate('created_at', $today)->whereIn('status', ['confirmed', 'completed'])->sum('total_price'),
                'week' => (float) Booking::where('created_at', '>=', $weekStart)->whereIn('status', ['confirmed', 'completed'])->sum('total_price'),
                'month' => (float) Booking::where('created_at', '>=', $monthStart)->whereIn('status', ['confirmed', 'completed'])->sum('total_price'),
            ],
            'active_hotels' => Hotel::where('status', 'active')->count(),
            'new_users' => User::where('created_at', '>=', $monthStart)->count(),
        ]);
    }

    public function revenueChart(): JsonResponse
    {
        $start = Carbon::today()->subDays(6);
        $rows = Booking::selectRaw('DATE(created_at) as date, SUM(total_price) as revenue')
            ->where('created_at', '>=', $start)
            ->whereIn('status', ['confirmed', 'completed'])
            ->groupBy('date')
            ->pluck('revenue', 'date');

        $data = collect(CarbonPeriod::create($start, Carbon::today()))
            ->map(fn (Carbon $date) => [
                'date' => $date->format('Y-m-d'),
                'revenue' => (float) ($rows[$date->format('Y-m-d')] ?? 0),
            ])
            ->values();

        return response()->json(['data' => $data]);
    }

    public function bookingStatus(): JsonResponse
    {
        $rows = Booking::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'data' => collect(['pending', 'confirmed', 'cancelled', 'completed'])
                ->map(fn (string $status) => ['status' => $status, 'count' => (int) ($rows[$status] ?? 0)])
                ->values(),
        ]);
    }
}
