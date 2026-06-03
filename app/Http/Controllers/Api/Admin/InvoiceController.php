<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvoiceController extends Controller
{
    public function __construct(private InvoiceService $invoiceService) {}

    public function download(Booking $booking): StreamedResponse|JsonResponse
    {
        if (! $this->invoiceService->isEligible($booking)) {
            return response()->json(['message' => 'Booking is not eligible for invoice'], 422);
        }

        return $this->invoiceService->generatePdf($booking);
    }
}
