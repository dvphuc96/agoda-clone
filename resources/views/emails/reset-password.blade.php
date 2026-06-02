<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password — GoStay</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f4; padding: 40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 40px 40px 24px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">GoStay</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 16px 40px;">
                            <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">Reset Your Password</p>
                            <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                We received a request to reset the password for your GoStay account. Click the button below to choose a new password.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 40px 32px 40px; text-align: center;">
                            <a href="{{ $resetUrl }}" style="display: inline-block; background-color: #0d9488; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 9999px;">
                                Reset Password
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #9ca3af; line-height: 1.6;">
                                If the button above doesn't work, copy and paste the following link into your browser:
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #0d9488; word-break: break-all;">
                                {{ $resetUrl }}
                            </p>
                            <p style="margin: 16px 0 0 0; font-size: 13px; color: #9ca3af; line-height: 1.6;">
                                This link will expire in 60 minutes. If you did not request a password reset, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
