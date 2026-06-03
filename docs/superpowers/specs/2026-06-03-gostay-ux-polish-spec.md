# GoStay — UX Polish Specification

## Overview

GoStay đã có đầy đủ core pages và components với design system tốt: skeleton loading, scroll reveal animations, spring transitions, error/empty states. Spec này tập trung nâng cấp UX polish lên mức premium OTA — không thêm feature mới, chỉ làm cho trải nghiệm hiện tại mượt mà, chuyên nghiệp và đáng tin cậy hơn.

**Approach đã chọn**: Approach A — Sequential milestone-based polish. Ưu tiên yếu tố ảnh hưởng trực tiếp đến conversion và user trust.

## Current State Assessment

### Đã tốt
- Skeleton loading trên hầu hết pages (HotelDetail, Search, Bookings, Wishlist, Notifications, Profile, Payment)
- Empty states có text + icon (Search, Wishlist, Bookings, Notifications)
- Scroll reveal animations (`.reveal` + `IntersectionObserver`)
- Spring transitions (`transition-spring` 600ms, `transition-spring-fast` 300ms)
- Custom GoStay color palette (Navy, Primary Teal, Gold, Warm cream)
- Shadcn/ui component framework với Geist Variable font
- Error handling với `isError` check + retry buttons

### Cần cải thiện
- Error states chưa có illustration/visual hierarchy — chỉ text + retry button
- Page transitions không có — navigation cảm giác "jump"
- Skeleton chưa match chính xác layout của content thực tế
- Toast/notification system chưa có — mutations chỉ hiện inline error
- Micro-interactions trên buttons/cards chưa consistent
- Booking flow (search → detail → booking → payment) thiếu progress indicator
- Responsive breakpoints cần fine-tuning cho tablet
- Form validation feedback chưa real-time

---

## Phase 1: Loading & Error States Enhancement

**Mục tiêu**: Mọi async state đều có skeleton chính xác, error state rõ ràng, và không bao giờ hiện blank screen.

### 1.1 Skeleton Fidelity

**Hiện tại**: Skeleton dùng `div.skeleton` với kích thước gần đúng.
**Mục tiêu**: Skeleton phải mirror layout thật 1:1.

| Page/Component | Cần làm |
|---|---|
| `SearchPage` | Skeleton cho filter sidebar + result cards với ảnh, text, price |
| `HotelDetailPage` | Skeleton cho gallery, info panel, room cards, reviews |
| `BookingPage` | Skeleton cho form fields + price sidebar |
| `PaymentPage` | Skeleton cho payment methods + booking summary |
| `FeaturedHotels` | Skeleton cho grid layout (large + small cards) |
| `LocationGrid` | Skeleton cho location cards với aspect ratio đúng |
| `ReviewList` | Skeleton cho review cards với avatar, stars, text |

**Pattern**:
```
- Container giữ nguyên layout (grid/flex)
- Mỗi element thay bằng div.skeleton với kích thước match
- Border-radius match component thật (rounded-2xl, rounded-xl, rounded-full)
- Aspect ratio giữ nguyên
- Không có layout shift khi data load xong
```

### 1.2 Error States

**Hiện tại**: Text message + retry button, không có visual hierarchy.
**Mục tiêu**: Error state có illustration, clear message, và actionable CTA.

**Error State Pattern**:
```
Container: centered, max-w-md, py-16
Icon: 48px, màu đỏ nhạt (destructive/20)
Title: font-semibold, text-lg, text-text
Description: text-sm, text-text-secondary
Actions: row of buttons (Retry primary, Back secondary)
```

| Page | Error message context | Actions |
|---|---|---|
| `SearchResults` | "Không thể tải kết quả tìm kiếm" | Retry, Clear Filters |
| `HotelDetailPage` | "Không thể tải thông tin khách sạn" | Retry, Back to Search |
| `BookingPage` | "Không thể tải thông tin đặt phòng" | Retry, Back to Hotel |
| `PaymentPage` | "Lỗi xử lý thanh toán" | Retry, Contact Support |
| `MyBookingsPage` | "Không thể tải danh sách booking" | Retry |
| `WishlistPage` | "Không thể tải danh sách yêu thích" | Retry |
| `ProfilePage` | "Không thể tải thông tin cá nhân" | Retry |

### 1.3 Empty States Enhancement

**Hiện tại**: Text-only empty states.
**Mục tiêu**: Empty state có illustration/svg, hướng dẫn action.

**Empty State Pattern**:
```
Container: centered, max-w-sm, py-16
Illustration: 120px SVG hoặc icon (CalendarX, Heart, Bell, SearchX)
Title: font-semibold, text-lg
Description: text-sm, text-text-secondary, max 2 dòng
CTA button: primary action (Browse Hotels, Search Again, etc.)
```

| Page | Illustration | CTA |
|---|---|---|
| `SearchResults` (no results) | SearchX icon | "Thử tìm kiếm khác" |
| `WishlistPage` | Heart icon | "Khám phá khách sạn" |
| `MyBookingsPage` | CalendarX icon | "Đặt phòng ngay" |
| `NotificationsPage` | BellOff icon | (no CTA, informational) |

---

## Phase 2: Transitions & Page Animations

**Mục tiêu**: Navigation mượt mà, không còn "page jump". Mọi state change đều có animation.

### 2.1 Page Transition

**Approach**: CSS-based fade transition trong React Router.

**Implementation**:
- Wrap `<Outlet>` trong `ClientLayout` với fade-in animation
- Mỗi page mount → fade in (opacity 0→1, translateY 8px→0, duration 300ms)
- Không dùng heavy animation library — chỉ CSS transition
- Keep scroll position behavior (scrollTo top on navigation)

```css
.page-enter {
  opacity: 0;
  transform: translateY(8px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms ease, transform 300ms ease;
}
```

### 2.2 Component State Transitions

| Component | Transition | Detail |
|---|---|---|
| `HotelCard` hover | `transition-spring` | translateY(-2px) + shadow elevation |
| `RoomTypeCard` expand | `transition-spring` | height auto-animate, opacity fade |
| `SearchFilters` toggle | `transition-spring-fast` | slide down/up panel |
| `MapPanel` show/hide | `transition-spring` | slide in from right |
| `BookingForm` step change | `transition-spring-fast` | slide left/right between steps |
| `MobileMenu` open/close | `transition-spring` | slide down from top |
| `Dropdown` (profile, language) | `transition-spring-fast` | scale(0.95→1) + opacity |
| `Modal/Dialog` open/close | `transition-spring` | scale(0.95→1) + backdrop fade |

### 2.3 Loading to Content Transition

**Pattern**: Khi skeleton → content thật, không bị flash.

```
1. Data arrives → set content opacity 0
2. Skeleton fades out (150ms)
3. Content fades in (200ms)
4. Layout shift = 0 (containers giữ nguyên kích thước)
```

---

## Phase 3: Micro-interactions & Feedback

**Mục tiêu**: Mọi user action có immediate visual feedback. App cảm giác "sống".

### 3.1 Button Interactions

| Button type | Hover | Active | Disabled |
|---|---|---|---|
| Primary (bg-primary) | darken 10%, shadow elevation | scale(0.97) | opacity 40%, cursor not-allowed |
| Secondary (outlined) | bg fill 5%, border darken | scale(0.97) | opacity 40% |
| Ghost/Icon | bg fill 8% | scale(0.95) | opacity 30% |
| Destructive | bg-red-600, shadow red | scale(0.97) | opacity 40% |

**All buttons**: `transition-spring-fast` (300ms cubic-bezier).

### 3.2 Toast / Notification System

**Cần**: Global toast component cho mutation feedback.

**Positions**: top-right, stack vertically.
**Types**:
- **Success**: green accent, check icon, auto-dismiss 3s
- **Error**: red accent, x icon, auto-dismiss 5s, dismissible
- **Info**: primary accent, info icon, auto-dismiss 3s

**Triggers**:
| Action | Toast type | Message |
|---|---|---|
| Booking created | Success | "Đặt phòng thành công!" |
| Payment success | Success | "Thanh toán thành công" |
| Booking cancelled | Success | "Đã hủy đặt phòng" |
| Profile updated | Success | "Cập nhật thành công" |
| Wishlist add | Success | "Đã thêm vào yêu thích" |
| Wishlist remove | Info | "Đã xóa khỏi yêu thích" |
| Login success | Success | "Đăng nhập thành công" |
| Register success | Success | "Đăng ký thành công" |
| Coupon applied | Success | "Áp dụng mã giảm giá thành công" |
| Coupon invalid | Error | "Mã giảm giá không hợp lệ" |
| Payment failed | Error | "Thanh toán thất bại, vui lòng thử lại" |
| Network error | Error | "Lỗi kết nối, vui lòng thử lại" |
| Logout | Info | "Đã đăng xuất" |

### 3.3 Form Validation Feedback

**Approach**: Real-time inline validation trên blur.

| Field | Validation | Message |
|---|---|---|
| Email | format check | "Email không hợp lệ" |
| Password | min 8 chars | "Mật khẩu tối thiểu 8 ký tự" |
| Phone | VN format | "Số điện thoại không hợp lệ" |
| Check-in/out | logic check | "Ngày trả phòng phải sau ngày nhận phòng" |
| Guests | min 1 | "Ít nhất 1 khách" |

**Visual**: Red border + shake animation (100ms) + error text below field.

### 3.4 Wishlist Heart Animation

**Current**: Simple toggle.
**Target**: Heart với scale pop animation.

```
- Unsaved → Saved: heart scales 1 → 1.3 → 1 (200ms spring)
- Fill color transitions from outline to filled red
- Small particle burst (optional, nếu không quá phức tạp)
```

---

## Phase 4: Booking Flow UX

**Mục tiêu**: Booking flow (Search → Detail → Booking → Payment → Confirmation) có progress indicator, breadcrumb, và clear next steps.

### 4.1 Booking Progress Bar

**Location**: Sticky bar dưới Navbar, chỉ hiện khi trong booking flow.

```
Steps: Search → Hotel Details → Booking Info → Payment → Confirmation
Active step: primary color, bold
Completed: primary + check icon
Upcoming: gray, light text
Progress line: animated fill giữa steps
```

**Pages where visible**: HotelDetailPage, BookingPage, PaymentPage, BookingDetailPage (confirmation).

### 4.2 Booking Confirmation Page Enhancement

**Current**: BookingDetailPage.
**Target**: Celebration moment + clear next steps.

```
Success state:
- Large checkmark animation (scale 0→1.2→1, 400ms spring)
- "Đặt phòng thành công!" heading
- Booking reference code (copyable)
- Booking summary card
- Timeline: confirmation → check-in → check-out

Action buttons:
- "Xem chi tiết đặt phòng" → BookingDetailPage
- "Tiếp tục tìm kiếm" → HomePage
```

### 4.3 Price Breakdown Clarity

**Current**: Basic subtotal + total.
**Target**: Detailed price breakdown panel.

```
Per-night price × nights = Subtotal
- Discount (coupon) = -XX,XXXđ
- Taxes & fees = XX,XXXđ
─────────────────
Total = XX,XXXđ
```

---

## Phase 5: Responsive & Accessibility Polish

**Mục tiêu**: App hoạt động hoàn hảo trên mọi kích thước màn hình, accessible cho tất cả users.

### 5.1 Responsive Breakpoints

**Target breakpoints** (mobile-first):
| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640px–1024px | 2 columns where possible |
| Desktop | 1024px–1280px | Full layout |
| Wide | > 1280px | Max-width container |

**Key responsive fixes**:
| Component | Issue | Fix |
|---|---|---|
| `SearchFilters` | Full overlay on mobile | Slide-up sheet pattern |
| `SearchResults` + `MapPanel` | Side-by-side on desktop | Stack on mobile, toggle map |
| `HotelDetailPage` gallery | Grid layout breaks on tablet | Adjust column spans |
| `BookingForm` | 2-column on desktop | Stack on mobile |
| `Navbar` | Hamburger menu | Already implemented |
| `HotelCard` grid | 3 cols → 2 → 1 | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |

### 5.2 Accessibility (a11y)

**WCAG 2.1 AA target**.

| Category | Requirement | Implementation |
|---|---|---|
| Focus management | Visible focus rings | `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` |
| Keyboard nav | All interactive reachable | Tab order logical, skip-to-content link |
| Screen reader | Meaningful alt text | `alt` on images, `aria-label` on icon buttons |
| Color contrast | Minimum 4.5:1 | Verify all text on backgrounds |
| Form labels | Associated labels | `htmlFor` + `id` pairing |
| Error announcements | `aria-live` regions | Toast container `aria-live="polite"` |
| Reduced motion | Respect preference | `@media (prefers-reduced-motion: reduce)` disable animations |

### 5.3 Performance UX

| Metric | Target | Approach |
|---|---|---|
| LCP | < 2.5s | Lazy load images, skeleton placeholders |
| FID | < 100ms | Code split pages, defer non-critical JS |
| CLS | < 0.1 | Fixed dimensions on images/skeletons |
| TTI | < 3.5s | Prefetch data on hover for likely navigation |

---

## Implementation Priority

| Phase | Impact | Effort | Priority |
|---|---|---|---|
| Phase 1: Loading & Error | High — directly affects trust | Medium | **P0** |
| Phase 3: Micro-interactions | High — makes app feel alive | Medium | **P0** |
| Phase 2: Transitions | Medium — polish feel | Low | **P1** |
| Phase 4: Booking Flow | High — conversion critical | Medium | **P1** |
| Phase 5: Responsive & a11y | Medium — reach & compliance | Medium | **P2** |

## Files to Modify

### New files
- `frontend/src/shared/components/Toast.tsx` — Global toast component
- `frontend/src/shared/components/ToastProvider.tsx` — Toast context + provider
- `frontend/src/client/components/common/EmptyState.tsx` — Reusable empty state
- `frontend/src/client/components/common/ErrorState.tsx` — Reusable error state
- `frontend/src/client/components/common/BookingProgressBar.tsx` — Booking flow progress
- `frontend/src/client/components/common/PageTransition.tsx` — Page fade wrapper

### Modified files
- `frontend/src/client/layouts/ClientLayout.tsx` — Add page transition + toast provider
- `frontend/src/client/components/home/FeaturedHotels.tsx` — Better skeletons
- `frontend/src/client/components/home/LocationGrid.tsx` — Better skeletons
- `frontend/src/client/components/home/HotelCard.tsx` — Button interactions, wishlist animation
- `frontend/src/client/components/hotel/WishlistButton.tsx` — Heart pop animation
- `frontend/src/client/components/hotel/RoomTypeCard.tsx` — Expand transition
- `frontend/src/client/components/hotel/ImageGallery.tsx` — Lightbox transition
- `frontend/src/client/components/hotel/ReviewList.tsx` — Better skeleton
- `frontend/src/client/components/search/SearchResults.tsx` — Error/empty states
- `frontend/src/client/components/search/SearchFilters.tsx` — Slide animation
- `frontend/src/client/components/search/MapPanel.tsx` — Slide transition
- `frontend/src/client/components/booking/BookingForm.tsx` — Validation feedback, step transitions
- `frontend/src/client/components/booking/CouponInput.tsx` — Success/error feedback
- `frontend/src/client/components/layout/Navbar.tsx` — Dropdown transitions
- `frontend/src/client/pages/*.tsx` — Consistent loading/error/empty states

## Non-goals

- Không thêm features mới (reviews, wishlist CRUD đã có)
- Không thay đổi design system (colors, fonts, spacing)
- Không thêm dark mode toggle (dark mode vars đã có nhưng không focus ở phase này)
- Không optimize backend API
- Không thêm animation library (framer-motion) — chỉ dùng CSS transitions
