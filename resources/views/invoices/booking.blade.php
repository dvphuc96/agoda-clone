<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $invoice_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; color: #1a1a1a; font-size: 13px; line-height: 1.5; }
        .container { max-width: 700px; margin: 0 auto; padding: 40px 30px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f766e; padding-bottom: 20px; margin-bottom: 24px; }
        .brand { font-size: 22px; font-weight: bold; color: #0f766e; }
        .brand-sub { font-size: 11px; color: #6f756f; }
        .invoice-label { font-size: 28px; font-weight: bold; color: #0f766e; text-align: right; }
        .invoice-meta { text-align: right; font-size: 12px; color: #6f756f; margin-top: 4px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #0f766e; border-bottom: 1px solid #ded4c6; padding-bottom: 6px; margin-bottom: 10px; letter-spacing: 0.5px; }
        .info-grid { display: flex; gap: 40px; }
        .info-block { flex: 1; }
        .info-label { font-size: 11px; color: #6f756f; text-transform: uppercase; letter-spacing: 0.3px; }
        .info-value { font-weight: bold; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #f6f1e9; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; color: #6f756f; border-bottom: 2px solid #ded4c6; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        .text-right { text-align: right; }
        .total-row { background: #0f766e; color: white; font-weight: bold; }
        .total-row td { padding: 12px 10px; border-bottom: none; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9b9387; border-top: 1px solid #ded4c6; padding-top: 16px; }
        .footer .contact { margin-top: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <div class="brand">GoStay</div>
                <div class="brand-sub">GoStay Travel Co., Ltd</div>
            </div>
            <div>
                <div class="invoice-label">INVOICE</div>
                <div class="invoice-meta">
                    Invoice #: {{ $invoice_number }}<br>
                    Date: {{ $invoice_date }}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Bill To</div>
            <div class="info-value">{{ $user_name }}</div>
            <div style="color: #6f756f;">{{ $user_email }}</div>
        </div>

        <div class="section">
            <div class="section-title">Booking Details</div>
            <div class="info-grid">
                <div class="info-block">
                    <div class="info-label">Hotel</div>
                    <div class="info-value">{{ $hotel_name }}</div>
                    <div style="color: #6f756f; font-size: 12px;">{{ $hotel_address }}</div>
                </div>
                <div class="info-block">
                    <div class="info-label">Room</div>
                    <div class="info-value">{{ $room_type }}</div>
                </div>
            </div>
            <div class="info-grid" style="margin-top: 12px;">
                <div class="info-block">
                    <div class="info-label">Check-in</div>
                    <div class="info-value">{{ $check_in }}</div>
                </div>
                <div class="info-block">
                    <div class="info-label">Check-out</div>
                    <div class="info-value">{{ $check_out }}</div>
                </div>
                <div class="info-block">
                    <div class="info-label">Nights</div>
                    <div class="info-value">{{ $nights }}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Charges</div>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Unit</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Room accommodation — {{ $room_type }}</td>
                        <td class="text-right">{{ $nights }}</td>
                        <td class="text-right">{{ number_format($price_per_night, 0, ',', '.') }} VND/night</td>
                        <td class="text-right">{{ number_format($subtotal, 0, ',', '.') }} VND</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3" class="text-right" style="font-size: 14px;">TOTAL</td>
                        <td class="text-right" style="font-size: 14px;">{{ number_format($total, 0, ',', '.') }} VND</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="info-grid">
                <div class="info-block">
                    <div class="info-label">Payment method</div>
                    <div class="info-value" style="text-transform: uppercase;">{{ $payment_method }}</div>
                </div>
                <div class="info-block">
                    <div class="info-label">Paid at</div>
                    <div class="info-value">{{ $paid_at }}</div>
                </div>
            </div>
        </div>

        <div class="footer">
            <div>Thank you for booking with GoStay.</div>
            <div class="contact">support@gostay.vn &nbsp;|&nbsp; 1900 6868</div>
        </div>
    </div>
</body>
</html>
