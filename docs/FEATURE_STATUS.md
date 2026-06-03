# GoStay — Feature Status

Last updated: 2026-06-03

## Implementation Summary

| # | Feature | Backend | Frontend (Client) | Frontend (Admin) | Spec |
|---|---------|---------|-------------------|------------------|------|
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
| 11 | Coupons/Promotions | CouponController, CouponService | coupon input in BookingPage | AdminCouponController | — |
| 12 | Rate Plans & Price Overrides | PriceResolutionService, PriceOverrideService | price breakdown in booking | AdminPriceOverrideController | [spec](superpowers/specs/2026-06-03-gostay-rate-plans-invoices-spec.md) |
| 13 | Support Tickets | SupportTicketController | SupportPage | AdminSupportTicketController | [spec](superpowers/specs/2026-06-03-gostay-support-audit-spec.md) |
| 14 | Audit Log | Auditable trait, AuditLogController | — | AuditLogPage | [spec](superpowers/specs/2026-06-03-gostay-support-audit-spec.md) |
| 15 | Invoices (PDF) | InvoiceService, DomPDF | download in BookingDetailPage | AdminInvoiceController | [spec](superpowers/specs/2026-06-03-gostay-rate-plans-invoices-spec.md) |
| 16 | Booking Modification | BookingModificationService | ModifyBookingPage | AdminBookingModificationController | — |
| 17 | Airport Transfers | TransferController, TransferBookingService | transfer search/booking | AdminTransferRouteController, AdminTransferVehicleTypeController | — |
| 18 | Profile Management | ProfileController | ProfilePage | — | — |
| 19 | Notifications | NotificationController | NotificationsPage | — | — |
| 20 | Map View | MapController | map integration in SearchPage | — | — |
| 21 | Admin Dashboard | DashboardController | — | DashboardPage, DashboardCharts | — |
| 22 | Admin CRUD (Locations/Hotels/Rooms/Users) | AdminLocationController, AdminHotelController, AdminUserController | — | full CRUD pages | — |
| 23 | UX Polish (Loading/Error States, Micro-interactions) | — | toast, skeletons, transitions | — | [spec](superpowers/specs/2026-06-03-gostay-ux-polish-spec.md) |

## Backend Models (22)

User, Hotel, Location, HotelImage, RoomType, Booking, Payment, Refund, BookingPolicy, BookingModification, NotificationRecord, Review, Wishlist, Coupon, CouponUsage, PriceOverride, SupportTicket, TicketMessage, TransferBooking, TransferRoute, TransferVehicleType, AuditLog

## Backend Services (15)

BookingService, PaymentService, CancellationService, RefundService, BookingPolicyService, BookingModificationService, NotificationService, ReviewService, WishlistService, CouponService, PriceResolutionService, InvoiceService, TransferBookingService, MapDistanceService, PasswordResetService

## Backend Controllers (33)

Public: 18 controllers | Admin: 19 controllers (including Dashboard)

## Frontend Client Pages (16)

HomePage, SearchPage, HotelDetailPage, BookingPage, MyBookingsPage, BookingDetailPage, ModifyBookingPage, PaymentPage, LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, ProfilePage, NotificationsPage, WishlistPage, SupportPage

## Frontend Admin Pages (13 directories + dashboard)

Dashboard, Locations, Hotels (including PriceOverrideListPage), Bookings, Payments, Users, Refunds, Policies, Coupons, Reviews, Support, Transfers, Modifications, Audit

## Email Templates (6)

booking-confirmed, booking-cancelled, cancellation-requested, refund-processed, reset-password, welcome

## Not Yet Implemented

See [Remaining Features Spec](superpowers/specs/2026-06-03-gostay-remaining-features-spec.md)
