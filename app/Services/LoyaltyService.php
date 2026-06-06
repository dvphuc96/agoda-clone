<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\LoyaltyAccount;
use App\Models\LoyaltyTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LoyaltyService
{
    public function getOrCreateAccount(User $user): LoyaltyAccount
    {
        return LoyaltyAccount::firstOrCreate(
            ['user_id' => $user->id],
            ['tier' => 'bronze']
        );
    }

    public function earnPoints(Booking $booking): ?LoyaltyTransaction
    {
        $account = $this->getOrCreateAccount($booking->user);

        // 1 point per 10,000 VND, with tier multiplier
        $basePoints = (int) floor((float) $booking->total_price / 10000);
        $multiplier = LoyaltyAccount::multiplierForTier($account->tier);
        $points = (int) ceil($basePoints * $multiplier);

        if ($points <= 0) {
            return null;
        }

        return DB::transaction(function () use ($account, $points, $booking) {
            $account->increment('points_balance', $points);
            $account->increment('lifetime_points', $points);

            $this->updateTier($account);

            return LoyaltyTransaction::create([
                'loyalty_account_id' => $account->id,
                'type' => 'earn',
                'points' => $points,
                'booking_id' => $booking->id,
                'description' => "Earned {$points} points from booking {$booking->booking_code}",
                'reference' => $booking->booking_code,
            ]);
        });
    }

    public function redeemPoints(User $user, int $points): LoyaltyTransaction
    {
        $account = $this->getOrCreateAccount($user);

        if ($account->points_balance < $points) {
            throw new \InvalidArgumentException('Insufficient points balance.');
        }

        if ($points <= 0) {
            throw new \InvalidArgumentException('Points must be greater than zero.');
        }

        return DB::transaction(function () use ($account, $points) {
            $account->decrement('points_balance', $points);

            return LoyaltyTransaction::create([
                'loyalty_account_id' => $account->id,
                'type' => 'redeem',
                'points' => $points,
                'description' => "Redeemed {$points} points",
                'reference' => 'REDEEM-' . now()->format('YmdHis'),
            ]);
        });
    }

    public function calculateDiscount(int $points): float
    {
        // 1 point = 1,000 VND
        return $points * 1000;
    }

    public function getAccountSummary(User $user): array
    {
        $account = $this->getOrCreateAccount($user);
        $nextTier = $this->getNextTierInfo($account);

        return [
            'points_balance' => $account->points_balance,
            'lifetime_points' => $account->lifetime_points,
            'tier' => $account->tier,
            'tier_multiplier' => LoyaltyAccount::multiplierForTier($account->tier),
            'discount_value' => $this->calculateDiscount($account->points_balance),
            'next_tier' => $nextTier,
            'created_at' => $account->created_at?->toIso8601String(),
        ];
    }

    public function getTransactions(User $user, int $perPage = 20)
    {
        $account = $this->getOrCreateAccount($user);

        return $account->transactions()
            ->with('booking')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    private function updateTier(LoyaltyAccount $account): void
    {
        $newTier = LoyaltyAccount::tierForPoints($account->lifetime_points);

        if ($newTier !== $account->tier) {
            $account->update([
                'tier' => $newTier,
                'tier_updated_at' => now(),
            ]);
        }
    }

    private function getNextTierInfo(LoyaltyAccount $account): ?array
    {
        $tiers = [
            'bronze' => ['next' => 'silver', 'threshold' => 1000],
            'silver' => ['next' => 'gold', 'threshold' => 5000],
            'gold' => ['next' => 'platinum', 'threshold' => 20000],
        ];

        $info = $tiers[$account->tier] ?? null;

        if (!$info) {
            return null;
        }

        return [
            'tier' => $info['next'],
            'points_needed' => max(0, $info['threshold'] - $account->lifetime_points),
            'threshold' => $info['threshold'],
        ];
    }
}
