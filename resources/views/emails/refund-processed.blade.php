@component('mail::message')
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#059669,#047857);padding:32px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">GoStay</h1>
                            <p style="margin:8px 0 0;color:#a7f3d0;font-size:14px;">Your Travel Companion</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:600;">Refund Processed</h2>
                            <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hello {{ $userName }}, your refund has been processed successfully.</p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ecfdf5;border-radius:8px;border:1px solid #a7f3d0;">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding:8px 0;color:#64748b;font-size:13px;width:140px;">Booking Code</td>
                                                <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;">{{ $booking->booking_code }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:8px 0;color:#64748b;font-size:13px;">Hotel</td>
                                                <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;">{{ $hotelName }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:8px 0;color:#64748b;font-size:13px;">Refund Amount</td>
                                                <td style="padding:8px 0;color:#059669;font-size:20px;font-weight:700;">${{ number_format($refund->amount, 2) }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:24px 0 0;color:#64748b;font-size:14px;line-height:1.6;">The refund will be credited to your original payment method within 5-10 business days, depending on your bank or payment provider.</p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ config('app.url', 'http://localhost:5173') . '/bookings' }}" style="display:inline-block;background-color:#059669;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;">View My Bookings</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:28px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">If you do not receive the refund within the expected timeframe, please contact our support team.</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                            <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; {{ date('Y') }} GoStay. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
@endcomponent
