<?php

namespace App\Services;

use App\Models\Refund;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RefundService
{
    public function __construct(
        private NotificationService $notificationService,
    ) {}

    public function approve(Refund $refund, User $admin, ?string $notes = null): Refund
    {
        if ($refund->status !== 'pending') {
            throw new \InvalidArgumentException('Chi co the duyet yeu cau dang cho xu ly');
        }

        return DB::transaction(function () use ($refund, $admin, $notes) {
            $refund->update([
                'status' => 'approved',
                'processed_by' => $admin->id,
                'processed_at' => now(),
                'admin_notes' => $notes,
            ]);

            $refund->booking->update(['status' => 'cancelled']);

            $successfulPayment = $refund->booking->payments()->where('status', 'success')->first();
            if ($successfulPayment) {
                $successfulPayment->update(['status' => 'refunded']);
            }

            $this->notificationService->notifyRefundApproved($refund->booking, $refund);

            return $refund->fresh();
        });
    }

    public function reject(Refund $refund, User $admin, ?string $notes = null): Refund
    {
        if ($refund->status !== 'pending') {
            throw new \InvalidArgumentException('Chi co the tu choi yeu cau dang cho xu ly');
        }

        $refund->update([
            'status' => 'rejected',
            'processed_by' => $admin->id,
            'processed_at' => now(),
            'admin_notes' => $notes,
        ]);

        $this->notificationService->notifyRefundRejected($refund->booking, $refund);

        return $refund->fresh();
    }

    public function markProcessed(Refund $refund, User $admin, ?string $notes = null): Refund
    {
        if ($refund->status !== 'approved') {
            throw new \InvalidArgumentException('Chi co the danh dau da xu ly yeu cau da duyet');
        }

        $refund->update([
            'status' => 'processed',
            'processed_by' => $refund->processed_by ?? $admin->id,
            'processed_at' => $refund->processed_at ?? now(),
            'admin_notes' => $notes ?? $refund->admin_notes,
        ]);

        return $refund->fresh();
    }
}
