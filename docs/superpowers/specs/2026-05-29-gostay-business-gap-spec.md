# GoStay — Business Gap Specification

## Overview

GoStay hiện đã có lõi marketplace đặt phòng: tìm kiếm khách sạn, xem phòng, tạo booking, thanh toán, quản trị locations/hotels/rooms/bookings/payments/users. Phần còn thiếu không nằm ở "có đặt phòng được hay không", mà nằm ở các nghiệp vụ giúp sản phẩm vận hành như một booking platform thật: quản lý tồn phòng chính xác, chính sách hủy/hoàn tiền, niềm tin người dùng, chăm sóc sau đặt phòng, khuyến mãi, và nghiệp vụ đối tác khách sạn.

Spec này ghi lại các nghiệp vụ nên bổ sung sau 3 milestone kỹ thuật đang chạy. Mục tiêu là giúp team chọn roadmap tiếp theo theo giá trị kinh doanh, không chỉ theo danh sách màn hình.

## Current Business Coverage

### Đã có

- User account: register, login, logout, current user.
- Discovery: locations, hotel search/filter/sort, hotel detail, room list.
- Booking core: tạo booking, kiểm tra phòng còn trống theo room type/date, xem booking, hủy booking pending.
- Payment core: VNPay/MoMo, callback, local fallback khi thiếu credentials, trạng thái payment.
- Admin operation: quản lý location, hotel, room type, booking, payment, user.
- Basic inventory: `room_types.total_rooms`, booking overlap check.

### Chưa có hoặc còn đơn giản

- Không có cancellation/refund policy theo từng khách sạn/phòng.
- Không có refund workflow thực sự.
- Không có email/SMS/notification xác nhận.
- Không có review/rating thật từ khách đã ở.
- Không có wishlist/favorite.
- Không có voucher/promotion/campaign.
- Không có hotel owner/partner portal.
- Không có audit log cho thao tác admin.
- Không có invoice/receipt.
- Không có support ticket/message sau booking.
- Không có rate plan/seasonal price/blackout date.
- Không có booking hold/expiry để tránh pending booking giữ phòng quá lâu.

## Proposed Business Capabilities

### 1. Booking Lifecycle & Policy

**Cần làm gì**

- Thêm policy hủy theo hotel/room/rate plan: miễn phí trước X ngày, phí hủy sau mốc, không hoàn tiền.
- Thêm trạng thái booking rõ hơn: `pending_payment`, `confirmed`, `cancel_requested`, `cancelled`, `completed`, `no_show`.
- Thêm booking expiry: booking pending quá thời gian cấu hình sẽ tự hủy/nhả phòng.
- Cho admin xử lý override: confirm, complete, mark no-show, approve/reject cancellation.

**Vì sao cần**

- Đây là nghiệp vụ cốt lõi của booking platform. Không có policy thì hủy/hoàn tiền dễ gây tranh chấp.
- Pending booking hiện có thể giữ inventory vô hạn nếu user không thanh toán.
- Admin cần thao tác theo lifecycle thật thay vì chỉ đổi status thủ công.

**Ưu tiên**: P0 sau MVP.

### 2. Refund & Payment Reconciliation

**Cần làm gì**

- Thêm refund request/approval workflow.
- Lưu refund amount, refund reason, refund status, processed_by.
- Tách payment success với booking confirmed, refund với booking cancelled.
- Thêm reconciliation view cho admin: payment gateway transaction, booking, amount, mismatch.

**Vì sao cần**

- Thanh toán online không kết thúc ở "paid"; vận hành thật cần hoàn tiền, đối soát và xử lý giao dịch lỗi.
- Giảm rủi ro kế toán và support khi gateway trả callback trễ hoặc user thanh toán nhiều lần.

**Ưu tiên**: P0 nếu chạy payment thật; P1 nếu chỉ demo/local.

### 3. Notifications & Transactional Email

**Cần làm gì**

- Email xác nhận booking.
- Email thanh toán thành công/thất bại.
- Email hủy booking/hoàn tiền.
- Admin notification khi có booking mới, payment failed, cancel request.
- Template email song ngữ theo locale user.

**Vì sao cần**

- Người dùng cần bằng chứng đặt phòng ngoài app.
- Giảm support vì khách tự xem được mã booking, trạng thái, chính sách.
- Admin/operator không phải refresh dashboard liên tục.

**Ưu tiên**: P0/P1.

### 4. Reviews & Trust Signals

**Cần làm gì**

- Cho user đã có booking completed đánh giá hotel/room.
- Review gồm rating, nội dung, ảnh optional, moderation status.
- Hiển thị average rating, review count, rating breakdown.
- Admin có moderation: approve, hide, flag.

**Vì sao cần**

- Booking platform cần tín hiệu niềm tin. Star rating khách sạn không thay thế được review khách thật.
- Review giúp cải thiện conversion ở hotel detail/search.
- Moderation tránh spam hoặc nội dung không phù hợp.

**Ưu tiên**: P1.

### 5. Wishlist/Favorites

**Cần làm gì**

- User lưu khách sạn yêu thích.
- Danh sách wishlist trong account.
- CTA save/unsave trên hotel card và hotel detail.

**Vì sao cần**

- Người dùng travel thường so sánh nhiều lựa chọn trước khi đặt.
- Wishlist giúp tăng return visit và conversion.
- Dữ liệu favorite hỗ trợ recommendation sau này.

**Ưu tiên**: P2.

### 6. Promotions, Vouchers & Campaigns

**Cần làm gì**

- Voucher code theo percent/fixed amount.
- Điều kiện áp dụng: date range, minimum booking value, location/hotel/room, usage limit, per-user limit.
- Admin campaign management.
- Booking price breakdown: subtotal, discount, final total.

**Vì sao cần**

- Khuyến mãi là nghiệp vụ tăng doanh thu/marketing quan trọng.
- Cần rule rõ để tránh lạm dụng mã giảm giá.
- Price breakdown giúp user tin tổng tiền.

**Ưu tiên**: P1/P2 tùy mục tiêu growth.

### 7. Rate Plans & Seasonal Pricing

**Cần làm gì**

- Tách base room type khỏi rate plan.
- Rate plan gồm price, cancellation policy, meal inclusion, refundable/non-refundable.
- Seasonal price theo date range, weekend surcharge, holiday blackout.
- Search/booking tính giá theo từng đêm thay vì `price_per_night * nights` cố định.

**Vì sao cần**

- Khách sạn thật không bán một giá cố định quanh năm.
- Cần hỗ trợ mùa cao điểm, cuối tuần, lễ tết, gói có/không ăn sáng.
- Đây là nền tảng cho revenue management.

**Ưu tiên**: P1 nếu muốn app giống OTA thật; P2 nếu demo MVP.

### 8. Hotel Owner / Partner Portal

**Cần làm gì**

- Role mới: `hotel_owner` hoặc `partner`.
- Partner chỉ quản lý hotel/room/booking thuộc quyền của họ.
- Partner dashboard: inventory, bookings, revenue, reviews.
- Admin duyệt hotel/room changes nếu cần.

**Vì sao cần**

- Nếu GoStay là marketplace, admin nội bộ không thể nhập và vận hành toàn bộ inventory mãi.
- Quyền theo owner là bước bắt buộc để onboard nhiều khách sạn.
- Giảm tải vận hành cho đội admin.

**Ưu tiên**: P1 cho marketplace thật; P2 nếu app chỉ demo.

### 9. Support Tickets & Booking Messages

**Cần làm gì**

- User tạo support ticket từ booking.
- Admin trả lời, đổi trạng thái ticket.
- Ticket categories: payment, cancellation, hotel issue, account.
- Lưu conversation history.

**Vì sao cần**

- Booking/payment/hủy phòng luôn phát sinh support.
- Không có ticket thì support bị rời rạc qua email/chat ngoài hệ thống.
- Gắn ticket với booking giúp operator xử lý nhanh.

**Ưu tiên**: P2.

### 10. Audit Log & Operational Controls

**Cần làm gì**

- Lưu audit log cho admin actions: create/update/delete hotel, update booking status, change user role, toggle active, refund actions.
- Audit fields: actor, action, entity type/id, before/after snapshot, timestamp, IP/user agent.
- Admin view/filter audit logs.

**Vì sao cần**

- Các thao tác admin ảnh hưởng tiền, booking, quyền user. Cần truy vết khi có lỗi hoặc tranh chấp.
- Đây là lớp bảo vệ vận hành trước khi có nhiều admin/partner.

**Ưu tiên**: P1 nếu có nhiều admin; P2 cho demo.

### 11. Invoices / Receipts

**Cần làm gì**

- Tạo receipt sau payment success.
- Lưu invoice number, billing name/email/phone, tax info optional.
- Cho user download/print receipt.
- Admin xem receipt trong booking/payment detail.

**Vì sao cần**

- Khách hàng cần chứng từ thanh toán.
- Doanh nghiệp cần hóa đơn/biên nhận cho đối soát.
- Giảm support request "gửi lại xác nhận thanh toán".

**Ưu tiên**: P1/P2.

### 12. Analytics & Revenue Reporting

**Cần làm gì**

- Revenue report theo ngày/tháng/location/hotel.
- Conversion funnel: search -> detail -> booking -> payment success.
- Occupancy report theo hotel/room type/date.
- Export CSV/PDF.

**Vì sao cần**

- Dashboard hiện chỉ là operational snapshot.
- Business cần biết khách sạn nào bán tốt, điểm rơi doanh thu, payment fail rate.
- Report hỗ trợ quyết định promotion, pricing, partnership.

**Ưu tiên**: P2.

## Recommended Roadmap

### Phase A — Make bookings operationally safe

1. Booking lifecycle + pending expiry.
2. Cancellation policy.
3. Refund workflow.
4. Transactional email.

**Lý do**: Đây là nhóm giảm rủi ro trực tiếp cho tiền và tồn phòng. Nên làm trước khi mở rộng marketing/growth.

### Phase B — Increase user trust and conversion

1. Reviews/ratings.
2. Receipts.
3. Wishlist.
4. Better booking/payment notifications.

**Lý do**: Sau khi core flow an toàn, cần tăng niềm tin và khả năng quay lại đặt phòng.

### Phase C — Marketplace and growth

1. Promotions/vouchers.
2. Rate plans + seasonal pricing.
3. Hotel owner portal.
4. Analytics/revenue reports.

**Lý do**: Đây là nhóm giúp GoStay tiến gần OTA/marketplace thật, nhưng phụ thuộc vào core vận hành ổn định.

### Phase D — Enterprise operations

1. Audit log.
2. Support tickets/messages.
3. Multi-admin permissions.
4. Advanced reconciliation.

**Lý do**: Cần khi số lượng admin/partner/giao dịch tăng và yêu cầu kiểm soát vận hành cao hơn.

## Data Model Candidates

Các bảng này chưa phải implementation plan cuối, chỉ là hướng schema để team đánh giá khi bước vào từng initiative.

- `booking_policies`: hotel_id, room_type_id nullable, cancellation rules, refund rules.
- `refunds`: payment_id, booking_id, amount, reason, status, requested_by, processed_by.
- `notifications`: user_id, type, channel, payload, status, sent_at.
- `reviews`: user_id, booking_id, hotel_id, rating, content, status.
- `wishlists`: user_id, hotel_id.
- `promotions`: code, discount_type, discount_value, constraints, usage limits.
- `rate_plans`: room_type_id, name, price rules, policy_id, inclusions.
- `hotel_owners`: user_id, hotel_id, role/status.
- `support_tickets`: user_id, booking_id, category, status, priority.
- `audit_logs`: actor_id, action, entity_type, entity_id, before, after.
- `receipts`: booking_id, payment_id, receipt_number, billing data, issued_at.

## Non-goals For The Current 3 Milestones

Không đưa các nghiệp vụ trên vào 3 milestone đang giao sub-agent, trừ khi milestone đó đã nhắc tới trực tiếp:

M1 tập trung hoàn thiện admin MVP hiện có.

M2 tập trung booking/payment flow thật.

M3 tập trung polish/QA.

Các nghiệp vụ trong spec này nên được tách thành initiative mới sau khi 3 milestone trên hoàn tất, để tránh conflict và scope creep.

## Success Criteria For This Spec

- Team có danh sách nghiệp vụ còn thiếu theo thứ tự ưu tiên.
- Mỗi nghiệp vụ có lý do kinh doanh rõ ràng.
- Có roadmap sau MVP không xung đột với 3 milestone đang chạy.
- Có candidate data model đủ để brainstorm/spec chi tiết vòng tiếp theo.
