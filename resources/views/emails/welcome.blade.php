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
                        <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.5px;">GoStay</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Your Travel Companion</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:600;">Welcome, {{ $userName }}!</h2>
                            <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">Thank you for joining GoStay. We are excited to have you on board! Discover amazing hotels, exclusive deals, and unforgettable travel experiences.</p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
                                <tr>
                                    <td style="padding:24px;">
                                        <h3 style="margin:0 0 16px;color:#1e40af;font-size:16px;font-weight:600;">Get Started</h3>
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding:8px 0;color:#2563eb;font-size:14px;">&#10003;&nbsp; Browse thousands of verified hotels</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:8px 0;color:#2563eb;font-size:14px;">&#10003;&nbsp; Book airport transfers with your stay</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:8px 0;color:#2563eb;font-size:14px;">&#10003;&nbsp; Best price guarantee on every booking</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:8px 0;color:#2563eb;font-size:14px;">&#10003;&nbsp; Free cancellation on selected properties</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ config('app.url', 'http://localhost:5173') }}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;">Start Exploring</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:28px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">If you have any questions, our support team is here to help. Happy travels!</p>
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
