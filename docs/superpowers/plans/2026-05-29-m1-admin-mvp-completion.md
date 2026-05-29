# Milestone 1 — Admin MVP Completion

## Goal

Hoàn thiện admin panel theo MVP spec: detail modal, filter đầy đủ, pagination, quản lý ảnh, Room Type modal.

## Scope

Admin only. Không sửa user booking/payment flow trừ khi cần type hoặc API shared nhỏ.

## Rules For The Sub-agent

- Không revert thay đổi của người khác.
- Nếu sửa React/TypeScript trong `frontend/src`, sau khi code xong bắt buộc chạy `npm run build` và `react-doctor`.
- Nếu `react-doctor` chưa có command/script trong repo, báo rõ command không tồn tại và dùng fallback `npm run build` + manual smoke.
- Giữ admin UI bằng tiếng Anh.
- Không đổi route lớn: admin dashboard canonical vẫn là `/admin/dashboard`.

## Tasks

1. Booking Admin
   - Thêm detail modal cho booking row.
   - Dùng `adminApi.booking(id)`.
   - Hiển thị booking code, user, hotel, room type, check-in/out, guests, total, status, special requests, payments.
   - Giữ update status hiện có.
   - Thêm filters: `hotel_id`, `date_from`, `date_to`.

2. Payment Admin
   - Thêm detail modal cho payment row.
   - Dùng `adminApi.payment(id)`.
   - Hiển thị booking code, method, amount, status, paid_at, transaction_id, gateway_response formatted JSON.
   - Thêm filters: `date_from`, `date_to`.

3. User Admin
   - Thêm detail modal cho user row.
   - Dùng `adminApi.user(id)`.
   - Hiển thị profile + booking history.
   - Giữ role change và enable/disable hiện có.

4. Tables
   - Thêm pagination controls reusable cho admin tables.
   - Dùng response `current_page`, `last_page`, `total`, hoặc fallback `meta`.
   - Thêm `page` và `per_page` vào query params.
   - Không đổi backend pagination contract nếu không cần.

5. Hotels
   - Bổ sung filters: location, star rating, status, search.
   - Thêm image preview list trong edit modal.
   - Thêm delete hotel image button dùng endpoint hiện có.

6. Room Types
   - Chuyển create/edit form từ side panel sang modal.
   - Thêm label trên mọi input.
   - Thêm image preview/upload trong edit modal.
   - Nếu cần xóa room image, thêm backend endpoint `DELETE /api/admin/room-types/images/{image}` và method trong `adminApi`.

## Acceptance Criteria

- Admin tables không còn kẹt ở page đầu.
- Booking/payment/user có thể xem detail từ row.
- Hotel filters hoạt động đủ: search, location, star, status.
- Booking filters hoạt động đủ: search, status, hotel, date range.
- Payment filters hoạt động đủ: method, status, date range.
- Room Type create/edit dùng modal, không còn side panel.
- Hotel image có thể upload và delete từ UI.

## Validation

- `php -l` cho controller/resource mới sửa.
- `php artisan route:list --path=api/admin`.
- `APP_KEY=... php artisan test`.
- `npm run build`.
- `react-doctor` nếu có React changes.
- Manual smoke:
  - `/admin/dashboard`
  - `/admin/hotels`
  - `/admin/hotels/:id/rooms`
  - `/admin/bookings`
  - `/admin/payments`
  - `/admin/users`
