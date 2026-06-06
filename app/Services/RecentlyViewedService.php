<?php

namespace App\Services;

use App\Models\RecentlyViewedHotel;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RecentlyViewedService
{
    public function recordView(User $user, int $hotelId): void
    {
        RecentlyViewedHotel::upsert(
            [
                'user_id' => $user->id,
                'hotel_id' => $hotelId,
                'viewed_at' => now(),
            ],
            ['user_id', 'hotel_id'],
            ['viewed_at']
        );

        $this->pruneOldEntries($user);
    }

    public function getRecentlyViewed(User $user, int $limit = 20)
    {
        return RecentlyViewedHotel::where('user_id', $user->id)
            ->with(['hotel.location', 'hotel.images', 'hotel.roomTypes'])
            ->orderByDesc('viewed_at')
            ->limit($limit)
            ->get()
            ->pluck('hotel')
            ->filter();
    }

    private function pruneOldEntries(User $user): void
    {
        $cutoff = RecentlyViewedHotel::where('user_id', $user->id)
            ->orderByDesc('viewed_at')
            ->skip(50)
            ->value('id');

        if ($cutoff) {
            RecentlyViewedHotel::where('user_id', $user->id)
                ->where('id', '<=', $cutoff)
                ->delete();
        }
    }
}
