# GoStay — Feature Status

Last updated: 2026-06-04

## Implementation Summary

| # | Feature | Backend | Frontend (Client) | Frontend (Admin/Partner) | Spec |
|---|---------|---------|-------------------|--------------------------|------|
| 1 | User Auth (Register/Login/Logout/Password Reset) | AuthController, PasswordResetService | LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage | — | — |
| 2 | Hotel Discovery (Search/Filter/Sort) | HotelController, LocationController | SearchPage, HotelDetailPage | — | — |
| 3 | Room Types & Availability | RoomTypeController | room list in HotelDetailPage | AdminRoomTypeController | — |
| 4 | Booking Core | BookingController, BookingService | BookingPage, MyBookingsPage, BookingDetailPage | AdminBookingController | — |
| 5 | Payment (VNPay/MoMo) | PaymentController, PaymentService | PaymentPage | AdminPaymentController | — |
| 6 | Booking Lifecycle & Policy | BookingPolicyService, CancellationService | cancel request flow | AdminBookingPolicyController | — |
| 7 | Refund Workflow | RefundService | refund request flow | AdminRefundController | — |
| 8 | Transactional Email | NotificationService, 6 Blade templates | — | — | — |
| 9 | Reviews & Ratings | ReviewController, ReviewService | review section in HotelDetailPage | AdminReviewController | — |
| 10 | Wishlist/Favorites | WishlistController, WishlistService | WishlistPage | — | — |
| 11 | Coupons/Promotions | CouponController, CouponService | coupon input + clickable list in BookingPage | AdminCouponController | — |
| 12 | Rate Plans & Price Overrides | PriceResolutionService, PriceOverrideService | price breakdown in booking | AdminPriceOverrideController | [spec](superpowers/specs/2026-06-03-gostay-rate-plans-invoices-spec.md) |
| 13 | Support Tickets | SupportTicketController | SupportPage | AdminSupportTicketController | [spec](superpowers/specs/2026-06-03-gostay-support-audit-spec.md) |
| 14 | Audit Log | Auditable trait, AuditLogController | — | AuditLogPage | [spec](superpowers/specs/2026-06-03-gostay-support-audit-spec.md) |
| 15 | Invoices (PDF) | InvoiceService, DomPDF | download in BookingDetailPage | AdminInvoiceController | [spec](superpowers/specs/2026-06-03-gostay-rate-plans-invoices-spec.md) |
| 16 | Booking Modification | BookingModificationService | ModifyBookingPage | AdminBookingModificationController | — |
| 17 | Airport Transfers | TransferController, TransferBookingService | transfer search/booking | AdminTransferRouteController, AdminTransferVehicleTypeController | — |
| 18 | Profile Management | ProfileController | ProfilePage | — | — |
| 19 | Notifications | NotificationController | NotificationDropdown (popup) + NotificationsPage | — | — |
| 20 | Map View | MapController | map integration in SearchPage | — | — |
| 21 | Admin Dashboard | DashboardController | — | DashboardPage, DashboardCharts | — |
| 22 | Admin CRUD (Locations/Hotels/Rooms/Users) | AdminLocationController, AdminHotelController, AdminUserController | — | full CRUD pages | — |
| 23 | UX Polish (Loading/Error States, Micro-interactions) | — | toast, skeletons, transitions | — | [spec](superpowers/specs/2026-06-03-gostay-ux-polish-spec.md) |
| 24 | Booking Hold & Expiry | ExpirePendingBookings command, scheduled every 5min | BookingCountdown in PaymentPage | — | — |
| 25 | Analytics & Reporting | AnalyticsService, AdminAnalyticsController | — | AnalyticsPage (recharts) | — |
| 26 | Partner Portal | PartnerDashboardController, PartnerHotelController, PartnerRoomTypeController, PartnerBookingController, PartnerPriceOverrideController | — | PartnerLayout, PartnerDashboardPage, PartnerHotelsPage, PartnerRoomsPage, PartnerBookingsPage | — |
| 27 | Chat / AI Assistant | ChatController, ChatService | ChatWidget (floating) | — | — |
| 28 | Social Login (Google/Facebook) | SocialAuthController, Socialite | SocialCallbackPage, social buttons on login/register | — | — |
| 29 | Room Availability Calendar | RoomTypeController::availabilityCalendar | AvailabilityCalendar (in HotelDetailPage) | — | — |
| 30 | Notification Badge Polling | — | auto-refresh every 60s in Navbar | — | — |
| 31 | ErrorBoundary | — | wraps client/admin/partner route groups | — | — |
| 32 | Partner Booking Management | PartnerBookingController::updateStatus | — | confirm/cancel actions in booking detail | — |
| 33 | Notification Read Status & Lifecycle | NotificationController (unread-count, markAsRead, markAllRead, destroy) | unread dot + bolder text, mark-as-read on click, mark-all-read, delete with confirm | — | [spec](superpowers/specs/2026-06-05-notification-read-status-design.md), [plan](superpowers/plans/2026-06-05-notification-read-status.md) |

## Backend Models (28)

User, Hotel, Location, HotelImage, HotelUser, RoomType, Booking, Payment, Refund, BookingPolicy, BookingModification, NotificationRecord, Review, Wishlist, Coupon, CouponUsage, PriceOverride, SupportTicket, TicketMessage, TransferBooking, TransferRoute, TransferVehicleType, AuditLog, ChatSession, ChatMessage

## Backend Services (16)

BookingService, PaymentService, CancellationService, RefundService, BookingPolicyService, BookingModificationService, NotificationService, ReviewService, WishlistService, CouponService, PriceResolutionService, InvoiceService, TransferBookingService, MapDistanceService, PasswordResetService, ChatService, AnalyticsService

## Backend Controllers (39)

Public: 18 controllers | Admin: 19 controllers | Partner: 5 controllers

## Frontend Client Pages (17)

HomePage, SearchPage, HotelDetailPage, BookingPage, PaymentPage, MyBookingsPage, BookingDetailPage, ModifyBookingPage, LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, ProfilePage, NotificationsPage, WishlistPage, SupportPage, SocialCallbackPage

## Frontend Admin Pages (14 directories + dashboard)

Dashboard, Analytics, Locations, Hotels (including PriceOverrideListPage), Bookings, Payments, Users, Refunds, Policies, Coupons, Reviews, Support, Transfers, Modifications, Audit

## Frontend Partner Pages (4)

PartnerDashboardPage, PartnerHotelsPage, PartnerRoomsPage, PartnerBookingsPage

## Email Templates (6)

booking-confirmed, booking-cancelled, cancellation-requested, refund-processed, reset-password, welcome

## Production Readiness

| Item | Status |
|------|--------|
| ErrorBoundary | ✅ Wraps all route groups |
| Notification Polling | ✅ 60s badge refresh |
| Booking Hold/Expiry | ✅ Scheduled command + countdown UI |
| SEO Meta Tags | 🔶 Not yet (needs react-helmet-async) |
