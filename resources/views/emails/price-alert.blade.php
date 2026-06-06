@component('mail::message')
# Giá phòng đã giảm!

Khách sạn **{{ $alert->hotel->name }}** hiện có giá **{{ number_format($currentPrice, 0, ',', '.') }}đ/đêm** — đạt mức giá bạn mong muốn ({{ number_format($alert->target_price, 0, ',', '.') }}đ).

@component('mail::button', ['url' => config('app.frontend_url', url('/')) . '/hotel/' . $alert->hotel->slug])
Xem khách sạn
@endcomponent

Cảm ơn bạn đã sử dụng GoStay!
@endcomponent
