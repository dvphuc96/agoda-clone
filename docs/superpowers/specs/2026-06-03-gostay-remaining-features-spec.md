# GoStay — Remaining Features Specification

Date: 2026-06-03

## Overview

GoStay đã triển khai 23 tính năng chính (xem [FEATURE_STATUS.md](../FEATURE_STATUS.md)). Spec này mô tả các nghiệp vụ còn thiếu, xếp theo ưu tiên kinh doanh.

## Feature 1: Booking Hold & Expiry

### Mô tả

Booking ở trạng thái `pending` hiện không có thời gian hết hạn. User có thể giữ phòng vô hạn nếu không thanh toán. Cần thêm booking expiry: sau X phút (cấu hình được), booking pending tự hủy và nhả phòng.

### Backend

- Thêm cột `expires_at` vào bảng `bookings` (nullable timestamp).
- Khi tạo booking pending, set `expires_at = now() + config('booking.hold_minutes', 30)`.
- Thêm scheduled command `BookingExpiryCommand` chạy mỗi 5 phút:
  - Tìm booking `status = 'pending'` AND `expires_at < now()`.
  - Chuyển sang `status = 'cancelled'`, ghi log `cancel_reason = 'expired'`.
  - Gửi notification cho user.
- Config qua `.env`: `BOOKING_HOLD_MINUTES=30`.

### Frontend

- BookingPage/BookingDetailPage hiển thị countdown timer khi booking pending.
- Khi hết hạn, redirect về trang search với thông báo.

### API Changes

- `POST /bookings` response thêm `expires_at`.
- `GET /bookings/{code}` response thêm `expires_at`, `remaining_seconds`.

---

## Feature 2: Analytics & Revenue Reporting

### Mô tả

Dashboard hiện chỉ hiển thị stats cơ bản (bookings today/week/month, revenue today/week/month). Cần báo cáo chi tiết hơn cho business decisions.

### Backend

- `AdminAnalyticsController` với các endpoints:
  - `GET /admin/analytics/revenue` — revenue theo ngày/tháng/năm, filter by location/hotel.
  - `GET /admin/analytics/occupancy` — occupancy rate theo hotel/room type/date range.
  - `GET /admin/analytics/conversion` — search → detail → booking → payment funnel.
  - `GET /admin/analytics/top-hotels` — top performing hotels by revenue/bookings.
  - `GET /admin/analytics/export` — CSV/PDF export.

### Frontend (Admin)

- `AnalyticsPage` với tabs: Revenue, Occupancy, Conversion, Top Hotels.
- Charts: line chart (revenue over time), bar chart (occupancy), funnel chart.
- Date range picker, location/hotel filters.
- Export button (CSV).

### Data Model

- Không cần bảng mới. Dữ liệu aggregate từ bookings + payments + hotel searches.

---

## Feature 3: Hotel Owner / Partner Portal

### Mô tả

Cho phép khách sạn tự quản lý thông tin, phòng, và xem booking. Hiện admin nội bộ phải quản lý tất cả.

### Backend

- Thêm role `hotel_owner` vào users.
- Bảng `hotel_user`: user_id, hotel_id, role (`owner`/`manager`).
- `PartnerHotelController`: partner chỉ xem/sửa hotel thuộc quyền.
- `PartnerRoomTypeController`: quản lý room types của hotel mình.
- `PartnerBookingController`: xem booking của hotel mình.
- `PartnerDashboardController`: stats cho hotel mình.
- Middleware `isHotelOwner` kiểm tra quyền truy cập.

### Frontend (Partner)

- Partner layout riêng (không dùng admin layout).
- `PartnerDashboardPage`: stats cho hotel.
- `PartnerHotelsPage`: quản lý hotel.
- `PartnerRoomsPage`: quản lý room types + price overrides.
- `PartnerBookingsPage`: xem booking.

### API Changes

- Routes nhóm `Route::middleware(['auth:sanctum', 'isHotelOwner'])->prefix('partner')`.
- Tất cả queries scoped theo hotel của partner.

---

## Feature 4: Chat / AI Assistant

### Mô tả

i18n đã có section `chat` nhưng chưa có implementation. Cho phép user chat với AI assistant để tìm khách sạn theo sở thích.

### Backend

- `ChatController`: nhận message, gọi AI API, trả response.
- Bảng `chat_sessions`: user_id, context (JSON), created_at.
- Bảng `chat_messages`: session_id, role (user/assistant), content.
- AI search: parse user intent → search hotels → format response.

### Frontend (Client)

- `ChatWidget`: floating button ở góc phải.
- Chat panel slide-up với conversation UI.
- Quick replies (destination, guests, dates, budget).
- Khi tìm được hotels, hiển thị hotel cards inline.

### Note

- Có thể dùng OpenAI API hoặc bất kỳ AI provider nào.
- i18n keys đã sẵn trong `chat` section.

---

## Feature 5: Room Availability Calendar

### Mô tả

Hiển thị calendar view cho admin xem tồn phòng theo ngày. User cũng có thể xem sơ đồ ngày trống/đầy.

### Backend

- `GET /admin/room-types/{id}/availability-calendar?month=YYYY-MM` — trả grid 30 ngày với available_rooms count.
- `GET /room-types/{id}/availability-calendar?month=YYYY-MM` — client version (chỉ available/unavailable).

### Frontend

- `AvailabilityCalendar` component: grid 7 columns (Mon-Sun), rows = weeks.
- Color coding: xanh = available, vàng = low stock, đỏ = sold out.
- Admin: click vào ngày để xem bookings cho ngày đó.
- Client: hiển thị trong room type detail.

---

## Feature 6: Photo Gallery & Lightbox

### Mô tả

Hotel detail hiện hiển thị ảnh nhưng chưa có lightbox viewer đầy đủ. Cần gallery với fullscreen view, navigation, zoom.

### Frontend Only

- `PhotoGallery` component: grid layout hiển thị all hotel images.
- `Lightbox` component: fullscreen overlay, prev/next navigation, zoom, close.
- Trigger từ "View all photos" button.
- Responsive: swipe trên mobile.

### Backend

- Không cần thay đổi. Đã có `HotelImage` model và upload/delete endpoints.

---

## Feature 7: Social Login (Google/Facebook)

### Mô tả

Cho phép user đăng nhập bằng Google/Facebook OAuth.

### Backend

- `SocialAuthController`: handle OAuth callback.
- Thêm `provider` + `provider_id` vào users table.
- Laravel Socialite package.
- Auto-create user nếu chưa có account.

### Frontend

- Google/Facebook buttons trên LoginPage và RegisterPage.
- Redirect flow hoặc popup flow.

---

## Feature 8: Multi-Admin Permissions

### Mô tả

Hiện chỉ có middleware `isAdmin` (binary). Cần role-based permissions chi tiết hơn.

### Backend

- Bảng `admin_roles`: name, permissions (JSON).
- Bảng `admin_role_user`: user_id, role_id.
- Middleware `hasPermission:resource.action`.
- Predefined roles: super_admin, content_manager, finance, support.

### Frontend (Admin)

- AdminLayout sidebar items filtered theo permissions.
- `AdminRolesPage` cho super_admin quản lý roles.
- Permission checks trên từng action.

---

## Recommended Implementation Order

| Phase | Features | Rationale |
| --- | --- | --- |
| Phase E — Operational Safety | Booking Hold/Expiry | Giảm rủi ro tồn phòng bị giữ vô hạn |
| Phase F — Business Intelligence | Analytics & Reporting | Cần dữ liệu để ra quyết định kinh doanh |
| Phase G — Marketplace | Partner Portal | Mở rộng quy mô, onboarding nhiều khách sạn |
| Phase H — UX Enhancement | Chat/AI, Calendar, Gallery | Tăng trải nghiệm user |
| Phase I — Growth | Social Login, Multi-admin Permissions | Giảm friction, tăng kiểm soát |

## Non-goals

- Multi-currency (VND only).
- Mobile app (web only).
- Push notifications (web only).
- Loyalty/points system.
- Hotel comparison feature.
