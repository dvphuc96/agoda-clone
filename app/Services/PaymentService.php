<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(
        private NotificationService $notificationService,
    ) {}
    public function createPayment(Booking $booking, string $method): array
    {
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => $method,
            'amount' => $booking->total_price,
            'status' => 'pending',
        ]);

        return match ($method) {
            'vnpay' => $this->createVNPayPayment($payment),
            'momo' => $this->createMoMoPayment($payment),
            default => throw new \InvalidArgumentException('Phuong thuc thanh toan khong hop le'),
        };
    }

    private function createVNPayPayment(Payment $payment): array
    {
        $vnp_TmnCode = config('services.vnpay.tmn_code');
        $vnp_HashSecret = config('services.vnpay.hash_secret');
        $vnp_Url = config('services.vnpay.url');
        $vnp_Returnurl = config('services.vnpay.return_url');

        if (!$vnp_TmnCode || !$vnp_HashSecret) {
            return $this->createLocalSuccessPayment($payment, 'vnpay');
        }

        $vnp_TxnRef = $payment->id . '_' . time();
        $vnp_OrderInfo = "Thanh toan dat phong GoStay #" . $payment->booking->booking_code;
        $vnp_OrderType = 'hotelbooking';
        $vnp_Amount = (int) round((float) $payment->amount * 100);
        $vnp_Locale = 'vn';
        $vnp_BankCode = '';
        $vnp_IpAddr = request()->ip();

        $inputData = [
            'vnp_Version' => '2.1.0',
            'vnp_TmnCode' => $vnp_TmnCode,
            'vnp_Amount' => $vnp_Amount,
            'vnp_Command' => 'pay',
            'vnp_CreateDate' => date('YmdHis'),
            'vnp_CurrCode' => 'VND',
            'vnp_IpAddr' => $vnp_IpAddr,
            'vnp_Locale' => $vnp_Locale,
            'vnp_OrderInfo' => $vnp_OrderInfo,
            'vnp_OrderType' => $vnp_OrderType,
            'vnp_ReturnUrl' => $vnp_Returnurl,
            'vnp_TxnRef' => $vnp_TxnRef,
        ];

        ksort($inputData);
        $query = '';
        $hashdata = '';
        foreach ($inputData as $key => $value) {
            $hashdata .= ($hashdata ? '&' : '') . urlencode($key) . '=' . urlencode($value);
            $query .= urlencode($key) . '=' . urlencode($value) . '&';
        }

        $vnp_SecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
        $payment->update([
            'transaction_id' => $vnp_TxnRef,
            'gateway_response' => ['frontend_origin' => $this->frontendOrigin()],
        ]);

        return [
            'payment_id' => $payment->id,
            'payment_url' => $vnp_Url . '?' . $query . 'vnp_SecureHash=' . $vnp_SecureHash,
        ];
    }

    private function createMoMoPayment(Payment $payment): array
    {
        $partnerCode = config('services.momo.partner_code');
        $accessKey = config('services.momo.access_key');
        $secretKey = config('services.momo.secret_key');
        $endpoint = config('services.momo.endpoint');
        $returnUrl = config('services.momo.return_url');

        if (!$partnerCode || !$accessKey || !$secretKey) {
            return $this->createLocalSuccessPayment($payment, 'momo');
        }

        $orderId = $payment->id . '_' . time();
        $orderInfo = "Thanh toan dat phong GoStay #" . $payment->booking->booking_code;
        $amount = (string) intval($payment->amount);
        $requestId = (string) Str::uuid();
        $requestType = 'captureWallet';
        $extraData = base64_encode(json_encode(['booking_code' => $payment->booking->booking_code]));

        $rawSignature = "accessKey={$accessKey}&amount={$amount}&extraData={$extraData}&ipnUrl={$returnUrl}&orderId={$orderId}&orderInfo={$orderInfo}&partnerCode={$partnerCode}&redirectUrl={$returnUrl}&requestId={$requestId}&requestType={$requestType}";
        $signature = hash_hmac('sha256', $rawSignature, $secretKey);

        $payment->update([
            'transaction_id' => $orderId,
            'gateway_response' => ['frontend_origin' => $this->frontendOrigin()],
        ]);

        $response = Http::post($endpoint, [
            'partnerCode' => $partnerCode,
            'accessKey' => $accessKey,
            'requestId' => $requestId,
            'amount' => $amount,
            'orderId' => $orderId,
            'orderInfo' => $orderInfo,
            'redirectUrl' => $returnUrl,
            'ipnUrl' => $returnUrl,
            'extraData' => $extraData,
            'requestType' => $requestType,
            'signature' => $signature,
            'lang' => 'vi',
        ]);

        $data = $response->json();

        if (!$response->successful() || empty($data['payUrl'])) {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $data ?: ['message' => 'MoMo did not return a payment URL'],
            ]);

            throw new \InvalidArgumentException('Khong the tao URL thanh toan MoMo');
        }

        return [
            'payment_id' => $payment->id,
            'payment_url' => $data['payUrl'] ?? null,
        ];
    }

    public function handleVNPayCallback(array $data): Payment
    {
        $vnp_HashSecret = config('services.vnpay.hash_secret');
        $inputData = [];
        foreach ($data as $key => $value) {
            if (str_starts_with($key, 'vnp_')) {
                $inputData[$key] = $value;
            }
        }

        unset($inputData['vnp_SecureHash']);
        ksort($inputData);
        $hashData = '';
        foreach ($inputData as $key => $value) {
            $hashData .= ($hashData ? '&' : '') . urlencode($key) . '=' . urlencode($value);
        }

        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        $payment = Payment::where('transaction_id', $data['vnp_TxnRef'])->firstOrFail();

        if ($secureHash === $data['vnp_SecureHash'] && $data['vnp_ResponseCode'] === '00') {
            $payment->update([
                'status' => 'success',
                'paid_at' => now(),
                'gateway_response' => $this->gatewayResponseWithOrigin($payment, $data),
            ]);
            $payment->booking->update(['status' => 'confirmed']);
            $this->notificationService->notifyBookingConfirmed($payment->booking);
        } else {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $this->gatewayResponseWithOrigin($payment, $data),
            ]);
        }

        return $payment;
    }

    public function handleMoMoCallback(array $data): Payment
    {
        $secretKey = config('services.momo.secret_key');

        $rawSignature = "accessKey={$data['accessKey']}&amount={$data['amount']}&extraData={$data['extraData']}&message={$data['message']}&orderId={$data['orderId']}&orderInfo={$data['orderInfo']}&orderType={$data['orderType']}&partnerCode={$data['partnerCode']}&payType={$data['payType']}&requestId={$data['requestId']}&responseTime={$data['responseTime']}&resultCode={$data['resultCode']}&transId={$data['transId']}";

        $signature = hash_hmac('sha256', $rawSignature, $secretKey);

        $payment = Payment::where('transaction_id', $data['orderId'])->firstOrFail();

        if ($signature === ($data['signature'] ?? null) && (string) ($data['resultCode'] ?? '') === '0') {
            $payment->update([
                'status' => 'success',
                'paid_at' => now(),
                'gateway_response' => $this->gatewayResponseWithOrigin($payment, $data),
            ]);
            $payment->booking->update(['status' => 'confirmed']);
            $this->notificationService->notifyBookingConfirmed($payment->booking);
        } else {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $this->gatewayResponseWithOrigin($payment, $data),
            ]);
        }

        return $payment;
    }

    private function createLocalSuccessPayment(Payment $payment, string $provider): array
    {
        if (!app()->environment(['local', 'testing'])) {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => ['message' => "{$provider} credentials are not configured"],
            ]);

            throw new \InvalidArgumentException('Cong thanh toan chua duoc cau hinh');
        }

        $transactionId = 'local_' . $provider . '_' . $payment->id . '_' . time();
        $payment->update([
            'transaction_id' => $transactionId,
            'status' => 'success',
            'paid_at' => now(),
            'gateway_response' => [
                'frontend_origin' => $this->frontendOrigin(),
                'provider' => $provider,
                'mode' => 'local',
                'message' => 'Simulated local payment because gateway credentials are not configured.',
            ],
        ]);
        $payment->booking->update(['status' => 'confirmed']);
        $this->notificationService->notifyBookingConfirmed($payment->booking);

        $frontendUrl = rtrim($this->frontendOrigin(), '/');

        return [
            'payment_id' => $payment->id,
            'payment_url' => $frontendUrl . '/payment/' . $payment->booking->booking_code . '?payment=success&provider=' . $provider . '&mode=local',
        ];
    }

    private function frontendOrigin(): string
    {
        $origin = request()->headers->get('origin');
        if ($origin) {
            return $origin;
        }

        $referer = request()->headers->get('referer');
        if ($referer) {
            $parts = parse_url($referer);
            if (!empty($parts['scheme']) && !empty($parts['host'])) {
                return $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '');
            }
        }

        return (string) config('app.frontend_url');
    }

    private function gatewayResponseWithOrigin(Payment $payment, array $data): array
    {
        $existing = $payment->gateway_response ?? [];

        return array_merge(
            isset($existing['frontend_origin']) ? ['frontend_origin' => $existing['frontend_origin']] : [],
            $data
        );
    }
}
