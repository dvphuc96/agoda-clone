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
                        <td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">GoStay</h1>
                            <p style="margin:8px 0 0;color:#fecaca;font-size:14px;">Your Travel Companion</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:600;">Booking Cancelled</h2>
                            <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hello {{ $userName }}, your booking has been cancelled.</p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border-radius:8px;border:1px solid #fecaca;">
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
                                                <td style="padding:8px 0;color:#64748b;font-size:13px;">Status</td>
                                                <td style="padding:8px 0;color:#dc2626;font-size:14px;font-weight:600;">Cancelled</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:24px 0 0;color:#64748b;font-size:14px;line-height:1.6;">If a refund is applicable, it will be processed according to the hotel's cancellation policy. You will receive a separate notification once the refund is processed.</p>

                            <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">If you did not request this cancellation, please contact our support team immediately.</p>
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
