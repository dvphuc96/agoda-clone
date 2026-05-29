# Milestone 2 — Booking & Payment Real Flow

## Goal

Bỏ placeholder booking data, dùng room type thật từ backend, và đảm bảo thanh toán user chạy ổn end-to-end.

## Scope

User-facing booking/payment flow + API hỗ trợ room type detail. Không làm admin polish ngoài những phần cần dùng chung.

## Rules For The Sub-agent

- Không revert thay đổi của người khác.
- Nếu sửa React/TypeScript trong `frontend/src`, sau khi code xong bắt buộc chạy `npm run build` và `react-doctor`.
- Nếu `react-doctor` chưa có command/script trong repo, báo rõ command không tồn tại và dùng fallback `npm run build` + manual smoke.
- User-facing UI phải dùng i18n hiện có, không hardcode text mới nếu có thể.
- Không bỏ local simulated payment fallback khi thiếu VNPAY/MoMo credentials.

## Tasks

1. Room Type Detail API
   - Thêm endpoint `GET /api/room-types/{roomType}`.
   - Response gồm room type, hotel, location, images, amenities, max_guests, price_per_night, available_rooms nếu tính được.
   - Dùng API Resource hiện có nếu phù hợp.

2. BookingPage
   - Xóa placeholder room data.
   - Gọi API room type detail theo `roomTypeId`.
   - Price summary dùng price thật.
   - Hotel name/room name/guest max lấy từ API.
   - Loading/error/not found state rõ ràng.

3. Booking Validation UX
   - Nếu thiếu `check_in`, `check_out`, hoặc guests invalid, hiển thị lỗi rõ.
   - Nếu user chưa login, redirect login giữ đủ query params để quay lại booking.

4. Payment Flow
   - Giữ local payment fallback hiện có khi thiếu VNPAY/MoMo credentials.
   - Đảm bảo callback success/fail hiển thị đúng trên `/payment/{bookingCode}`.
   - Sau payment success, booking detail hiển thị status `confirmed` và payment `success`.

5. BookingDetailPage
   - Hiển thị payment mới nhất rõ hơn.
   - Nếu booking pending thì có CTA thanh toán.
   - Nếu booking confirmed/completed thì không hiện CTA pay now.

## Acceptance Criteria

- User vào hotel detail chọn room rồi booking summary đúng room/hotel/price thật.
- Create booking thành công điều hướng sang `/payment/{bookingCode}`.
- Pay VNPAY/MoMo ở local trả success bằng simulated fallback.
- Booking chuyển `confirmed`, payment chuyển `success`.
- Không còn comment/logic placeholder trong `BookingPage`.

## Validation

- `php -l` controller/resource/service mới sửa.
- `APP_KEY=... php artisan test`.
- `npm run build`.
- `react-doctor` nếu có React changes.
- Manual smoke:
  - Search hotel -> hotel detail -> select room -> booking -> payment -> success.
  - Login redirect về booking vẫn giữ query params.
  - Booking detail hiển thị payment status đúng.
