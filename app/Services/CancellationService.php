<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CancellationService
{
    public function __construct(
        private BookingPolicyService $policyService,
        private NotificationService $notificationService,
    ) {}

    public function requestCancellation(Booking $booking, User $user, ?string $reason = null): array
    {
        if ($booking->user_id !== $user->id) {
            throw new \InvalidArgumentException('Ban khong co quyen huy dat phong nay');
        }

        $eligibility = $this->policyService->getCancellationEligibility($booking);

        if (!$eligibility['can_cancel']) {
            throw new \InvalidArgumentException($eligibility['reason']);
        }

        $existingRefund = Refund::where('booking_id', $booking->id)
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($existingRefund) {
            throw new \InvalidArgumentException('Da co yeu cau huy/hoan tien cho dat phong nay');
        }

        return DB::transaction(function () use ($booking, $user, $reason, $eligibility) {
            $successfulPayment = $booking->payments()->where('status', 'success')->first();

            $refund = Refund::create([
                'booking_id' => $booking->id,
                'payment_id' => $successfulPayment?->id,
                'amount' => $eligibility['refund_amount'],
                'reason' => $reason,
                'status' => $eligibility['is_free'] ? 'approved' : 'pending',
                'requested_by' => $user->id,
            ]);

            if ($eligibility['is_free']) {
                $refund->update([
                    'processed_by' => $user->id,
                    'processed_at' => now(),
                ]);
                $booking->update(['status' => 'cancelled']);

                if ($successfulPayment) {
                    $successfulPayment->update(['status' => 'refunded']);
                }

                $this->notificationService->notifyBookingCancelled($booking);
            } else {
                $this->notificationService->notifyCancellationRequested($booking);
            }

            return [
                'refund' => $refund,
                'eligibility' => $eligibility,
            ];
        });
    }
}
