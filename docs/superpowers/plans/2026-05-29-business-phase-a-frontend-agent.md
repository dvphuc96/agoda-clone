# Business Phase A — Frontend Agent Task

## Goal

Triển khai UI cho các nghiệp vụ Phase A sau khi backend contract có hoặc đang được backend agent cung cấp: cancellation/refund request, booking policy display, notification records, admin refund/policy management.

## Scope

Frontend React only, ưu tiên:

- `frontend/src/client/*`
- `frontend/src/admin/*`
- `frontend/src/shared/api/*`
- `frontend/src/shared/i18n/*`

Không sửa Laravel backend, migrations, services, routes. Nếu API contract thiếu, ghi rõ blocker và dùng minimal defensive UI thay vì tự tạo backend.

## Must Not Do

- Không sửa backend.
- Không làm reviews, wishlist, promotions, partner portal, analytics trong task này.
- Không revert thay đổi của agent khác.
- Không hardcode text mới ở client UI; user-facing text phải qua i18n.
- Admin UI giữ English.

## Dependency On Backend Agent

Frontend agent nên đọc backend routes/API contract mới nhất trước khi code. Nếu backend chưa xong, làm theo contract dự kiến trong `2026-05-29-business-phase-a-backend-agent.md`, nhưng mọi API call phải có error state rõ.

## Tasks

1. Shared API client
   - Thêm methods cho:
     - booking cancel/refund request.
     - notifications list.
     - admin refunds list/detail/status update.
     - admin booking policies CRUD.
   - TypeScript types cho policy/refund/notification response.

2. Customer booking detail
   - Hiển thị cancellation policy summary.
   - Nếu booking đủ điều kiện, hiển thị CTA request cancellation/refund.
   - Form request gồm reason.
   - Sau submit, refresh booking detail và hiển thị status request.
   - Không hiện CTA khi booking không đủ điều kiện hoặc đã completed/cancelled.

3. Customer notifications
   - Thêm UI danh sách notification records đơn giản.
   - Có thể đặt trong account/bookings area, không cần realtime.
   - Hiển thị type, message, status/time nếu backend trả.

4. Admin refunds
   - Thêm page hoặc section `/admin/refunds`.
   - Table list refunds: booking, user, amount, reason, status, requested_at.
   - Detail modal xem booking/payment context.
   - Action approve/reject/process theo status backend cho phép.

5. Admin booking policies
   - Thêm page hoặc section `/admin/policies`.
   - CRUD policy bằng modal form.
   - Fields theo backend: hotel/room scope, cutoff, fee/non-refundable.
   - Có validation/error state rõ.

6. Navigation
   - Thêm admin sidebar items nếu tạo page mới:
     - Refunds
     - Policies
   - Không làm topbar redesign lớn trong task này.

## UX Requirements

- Loading, empty, error state cho các page/section mới.
- Destructive/financial action như approve/reject refund phải có confirm.
- Form submit disabled khi pending.
- Client text song ngữ Vietnamese/English qua i18n.
- Admin text English.

## Acceptance Criteria

- User booking detail hiển thị policy và có thể request cancellation/refund khi API cho phép.
- User xem được notifications.
- Admin xem và xử lý refund requests.
- Admin quản lý booking policies.
- UI không crash nếu backend trả thiếu optional fields.

## Validation

- `npm run build`.
- `react-doctor`.
- Nếu `react-doctor` chưa có command/script trong repo, báo rõ và fallback bằng `npm run build` + manual smoke.
- Manual smoke:
  - `/bookings/:bookingCode`
  - notifications UI
  - `/admin/refunds`
  - `/admin/policies`
  - approve/reject refund action with confirm.

## Final Report Required

Frontend agent must report:

- New routes/pages/components.
- API methods/types added.
- i18n keys added.
- Any backend contract mismatch or blocker.
- Validation commands run and results.
