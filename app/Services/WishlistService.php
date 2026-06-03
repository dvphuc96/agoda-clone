<?php

namespace App\Services;

use App\Models\Hotel;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class WishlistService
{
    public function toggle(User $user, int $hotelId): array
    {
        return DB::transaction(function () use ($user, $hotelId) {
            $existing = Wishlist::where('user_id', $user->id)
                ->where('hotel_id', $hotelId)
                ->first();

            if ($existing) {
                $existing->delete();
                return ['is_wishlisted' => false];
            }

            Wishlist::create([
                'user_id' => $user->id,
                'hotel_id' => $hotelId,
            ]);

            return ['is_wishlisted' => true];
        });
    }

    public function isInWishlist(User $user, int $hotelId): bool
    {
        return Wishlist::where('user_id', $user->id)
            ->where('hotel_id', $hotelId)
            ->exists();
    }

    public function getUserWishlists(User $user): Collection
    {
        return Wishlist::where('user_id', $user->id)
            ->with([
                'hotel.location',
                'hotel.images',
                'hotel.roomTypes',
            ])
            ->latest()
            ->get();
    }
}
