<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvoiceController extends Controller
{
    public function __construct(private InvoiceService $invoiceService) {}

    public function download(string $bookingCode): StreamedResponse|JsonResponse
    {
        $booking = Booking::where('booking_code', $bookingCode)->firstOrFail();

        if ($booking->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (! $this->invoiceService->isEligible($booking)) {
            return response()->json(['message' => 'Booking is not eligible for invoice'], 422);
        }

        return $this->invoiceService->generatePdf($booking);
    }
}
