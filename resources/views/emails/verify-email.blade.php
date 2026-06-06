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
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Verify Your Email Address</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:600;">Hello, {{ $userName }}!</h2>
                            <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">Thank you for registering with GoStay. Please verify your email address to activate your account and start booking hotels.</p>

                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding:8px 0 28px;">
                                        <a href="{{ $verificationUrl }}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;">Verify Email Address</a>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding:16px 24px;">
                                        <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.6;">If the button above doesn't work, copy and paste the following link into your browser:</p>
                                        <p style="margin:0;color:#2563eb;font-size:12px;word-break:break-all;">{{ $verificationUrl }}</p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">This link will expire in 60 minutes. If you did not create an account, no further action is required.</p>
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
