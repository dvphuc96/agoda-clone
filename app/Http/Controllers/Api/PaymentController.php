<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $paymentService) {}

    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => ['required', 'exists:bookings,id'],
            'payment_method' => ['required', 'in:vnpay,momo'],
        ]);

        $booking = $request->user()->bookings()->findOrFail($request->booking_id);

        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'Dat phong khong o trang thai cho thanh toan'], 422);
        }

        try {
            $result = $this->paymentService->createPayment($booking, $request->payment_method);
            return response()->json($result);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function vnpayCallback(Request $request)
    {
        $payment = $this->paymentService->handleVNPayCallback($request->all());
        return redirect(config('app.frontend_url') . '/booking/' . $payment->booking->booking_code . '?payment=' . $payment->status);
    }

    public function momoCallback(Request $request)
    {
        $payment = $this->paymentService->handleMoMoCallback($request->all());
        return redirect(config('app.frontend_url') . '/booking/' . $payment->booking->booking_code . '?payment=' . $payment->status);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $payment = Payment::where('id', $id)
            ->whereHas('booking', fn($q) => $q->where('user_id', $request->user()->id))
            ->firstOrFail();

        return response()->json(new PaymentResource($payment));
    }
}
