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
                        <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">GoStay</h1>
                            <p style="margin:8px 0 0;color:#fef3c7;font-size:14px;">Your Travel Companion</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:600;">Cancellation Request Received</h2>
                            <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Hello {{ $userName }}, we have received your cancellation request.</p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border-radius:8px;border:1px solid #fde68a;">
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
                                                <td style="padding:8px 0;color:#d97706;font-size:14px;font-weight:600;">Pending Review</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:24px 0 0;color:#64748b;font-size:14px;line-height:1.6;">Your cancellation request is now being reviewed. Our team will process it as soon as possible and you will receive another email once a decision has been made.</p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ config('app.url', 'http://localhost:5173') . '/bookings' }}" style="display:inline-block;background-color:#f59e0b;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;">View My Bookings</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:28px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">If you have any questions, please contact our support team.</p>
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
