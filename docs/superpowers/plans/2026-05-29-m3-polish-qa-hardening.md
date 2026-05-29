# Milestone 3 — Polish, QA, and Hardening

## Goal

Chuẩn hóa UX, error/loading states, accessibility labels, confirm destructive actions, và kiểm thử toàn luồng sau Milestone 1-2.

## Scope

Polish toàn app, không thêm feature lớn mới. Không làm voucher, audit log, realtime notification, multi-admin permission.

## Rules For The Sub-agent

- Không revert thay đổi của người khác.
- Nếu sửa React/TypeScript trong `frontend/src`, sau khi code xong bắt buộc chạy `npm run build` và `react-doctor`.
- Nếu `react-doctor` chưa có command/script trong repo, báo rõ command không tồn tại và dùng fallback `npm run build` + manual smoke.
- M3 nên chạy sau M1 và M2 vì đây là polish/QA tổng hợp.
- Không đổi behavior lớn nếu chưa có bug rõ ràng.

## Tasks

1. Admin UX Polish
   - Thêm loading/empty/error state nhất quán cho admin pages.
   - Mọi destructive action phải có confirm: delete location, delete hotel, delete room type, delete image, cancel booking.
   - Nút submit/upload disabled khi mutation pending.
   - Validation API error hiển thị trong modal/form.

2. Form Consistency
   - Mọi input/select/textarea có visible label hoặc accessible label phù hợp.
   - Locations/Hotels/Room Types dùng cùng modal/form style.
   - Button text thống nhất: Create, Save changes, Cancel, Delete.

3. Responsive QA
   - Check admin sidebar/mobile menu.
   - Check table horizontal scroll.
   - Check modal max-height và scroll nội bộ.
   - Check text không overflow ở mobile.

4. i18n QA
   - User-facing pages dùng i18n, không hardcode tiếng Anh nếu thuộc client UI.
   - Admin UI giữ English theo quyết định cũ.
   - Không còn chữ Việt không dấu ở user-facing error nếu có thể đưa vào i18n.

5. Docker Dev Workflow
   - Xác nhận frontend live mount vẫn hoạt động.
   - Document ngắn khi nào cần rebuild Docker:
     - Không cần rebuild khi sửa React/CSS.
     - Cần restart khi đổi dependency.
     - Cần rebuild khi đổi Dockerfile/production image.

6. Full Smoke Checklist
   - Reset DB từ seed.
   - Admin login.
   - CRUD location/hotel/room type.
   - Booking user flow.
   - Payment local success.
   - Admin booking/payment/user detail.
   - CSV export.

## Acceptance Criteria

- App build pass.
- PHP tests pass.
- Không có admin form chính thiếu label.
- Không có destructive action chính chạy không confirm.
- Docker dev workflow rõ ràng, không yêu cầu rebuild UI mỗi lần sửa.
- Manual smoke checklist pass.

## Validation

- `npm run build`.
- `react-doctor` nếu có React changes.
- `APP_KEY=... php artisan test`.
- `php artisan route:list`.
- Manual browser smoke trên `http://127.0.0.1:5173`.
