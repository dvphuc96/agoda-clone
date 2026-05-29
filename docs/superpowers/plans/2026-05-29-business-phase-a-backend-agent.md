# Business Phase A — Backend Agent Task

## Goal

Triển khai nền nghiệp vụ vận hành an toàn cho booking/payment: booking lifecycle rõ ràng, cancellation policy, refund workflow cơ bản, và notification records. Đây là backend contract để frontend/admin agent bám theo.

## Scope

Backend Laravel only, ưu tiên `app/`, `database/`, `routes/api.php`, API Resources/Requests/Services. Không sửa React trừ khi bắt buộc cập nhật shared type rất nhỏ; nếu có sửa React thì phải chạy `npm run build` và `react-doctor`.

## Must Not Do

- Không làm reviews, wishlist, promotions, hotel owner portal, support tickets, analytics trong task này.
- Không phá local simulated payment fallback hiện có.
- Không revert thay đổi của agent khác.
- Không đổi route public hiện có nếu không cần.

## Business Requirements

1. Booking lifecycle
   - Giữ tương thích status hiện có nếu có thể: `pending`, `confirmed`, `cancelled`, `completed`.
   - Thêm nghiệp vụ pending expiry: booking pending quá thời gian cấu hình có thể được mark/cancel để nhả phòng.
   - Nếu cần thêm status mới, phải cập nhật casts/types/resources/API validation đầy đủ và ghi rõ trong final report.

2. Cancellation policy
   - Thêm model/schema policy tối thiểu để mô tả:
     - áp dụng theo hotel hoặc room type.
     - free cancellation cutoff theo giờ/ngày trước check-in.
     - cancellation fee hoặc non-refundable.
   - Booking detail API phải trả policy snapshot hoặc policy summary đủ để frontend hiển thị.
   - Khi user/admin cancel booking, service phải tính được booking có được hủy không và fee/refund dự kiến.

3. Refund workflow
   - Thêm records cho refund request/processing.
   - Fields tối thiểu: booking_id, payment_id nullable, amount, reason, status, requested_by, processed_by nullable, processed_at nullable.
   - API cho user request refund/cancellation nếu booking đủ điều kiện.
   - API cho admin list/detail/update refund status.
   - Không cần gọi gateway refund thật ở task này; chỉ quản lý workflow nội bộ.

4. Notification records
   - Thêm records lưu notification event: user_id, booking_id nullable, type, channel, status, payload, sent_at nullable.
   - Tạo notification record khi booking confirmed/cancelled/refund status changed.
   - Không bắt buộc gửi email thật trong task này.

## Suggested API Contract

Keep exact route names reasonable, but provide these capabilities:

- User:
  - `GET /api/bookings/{bookingCode}` includes cancellation/refund/policy info.
  - `POST /api/bookings/{bookingCode}/cancel-request` creates cancellation/refund request when applicable.
  - `GET /api/notifications` lists current user's notification records.
- Admin:
  - `GET /api/admin/refunds`
  - `GET /api/admin/refunds/{refund}`
  - `PATCH /api/admin/refunds/{refund}/status`
  - `GET /api/admin/booking-policies`
  - `POST /api/admin/booking-policies`
  - `PUT /api/admin/booking-policies/{policy}`
  - `DELETE /api/admin/booking-policies/{policy}`

## Implementation Notes

- Put lifecycle logic in service classes, not controllers.
- Use Form Request validation if request payload grows beyond trivial validation.
- Use API Resources for new response shapes.
- Ensure cancellation/refund calculations are deterministic and easy to test.
- Prefer additive migrations over modifying old migration files unless project convention says fresh-only.

## Acceptance Criteria

- Existing booking/payment flow still works.
- User can see cancellation/refund eligibility from booking detail API.
- User can create a cancellation/refund request when allowed.
- Admin can list and approve/reject refund requests.
- Admin can create/update/delete booking policies.
- Notification records are created for key lifecycle events.

## Validation

- `php -l` for all new/changed PHP files.
- `php artisan route:list`.
- `APP_KEY=... php artisan test`.
- API smoke with seeded DB:
  - create booking.
  - local payment success.
  - booking detail includes policy/refund info.
  - create cancel/refund request.
  - admin approves/rejects refund.

## Final Report Required

Backend agent must report:

- New migrations/models/routes/resources.
- Exact status values and refund status values.
- Any frontend contract changes.
- Validation commands run and results.
