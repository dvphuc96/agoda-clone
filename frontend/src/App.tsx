import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { I18nProvider } from './shared/i18n/I18nProvider';
import { AuthProvider } from './shared/contexts/AuthContext';
import ClientLayout from './client/layouts/ClientLayout';
import HomePage from './client/pages/HomePage';
import SearchPage from './client/pages/SearchPage';
import HotelDetailPage from './client/pages/HotelDetailPage';
import BookingPage from './client/pages/BookingPage';
import PaymentPage from './client/pages/PaymentPage';
import LoginPage from './client/pages/LoginPage';
import RegisterPage from './client/pages/RegisterPage';
import ForgotPasswordPage from './client/pages/ForgotPasswordPage';
import ResetPasswordPage from './client/pages/ResetPasswordPage';
import MyBookingsPage from './client/pages/MyBookingsPage';
import BookingDetailPage from './client/pages/BookingDetailPage';
import ModifyBookingPage from './client/pages/ModifyBookingPage';
import NotificationsPage from './client/pages/NotificationsPage';
import WishlistPage from './client/pages/WishlistPage';
import ProfilePage from './client/pages/ProfilePage';
import SupportPage from './client/pages/SupportPage';
import SocialCallbackPage from './client/pages/SocialCallbackPage';

const AdminLayout = lazy(() => import('./admin/components/layout/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./admin/pages/DashboardPage'));
const AdminLocationListPage = lazy(() => import('./admin/pages/locations/LocationListPage'));
const AdminHotelListPage = lazy(() => import('./admin/pages/hotels/HotelListPage'));
const AdminRoomTypeListPage = lazy(() => import('./admin/pages/hotels/RoomTypeListPage'));
const AdminBookingListPage = lazy(() => import('./admin/pages/bookings/BookingListPage'));
const AdminPaymentListPage = lazy(() => import('./admin/pages/payments/PaymentListPage'));
const AdminRefundListPage = lazy(() => import('./admin/pages/refunds/RefundListPage'));
const AdminPolicyListPage = lazy(() => import('./admin/pages/policies/PolicyListPage'));
const AdminUserListPage = lazy(() => import('./admin/pages/users/UserListPage'));
const AdminTransferListPage = lazy(() => import('./admin/pages/transfers/TransferListPage'));
const AdminCouponListPage = lazy(() => import('./admin/pages/coupons/CouponListPage'));
const AdminReviewListPage = lazy(() => import('./admin/pages/reviews/ReviewListPage'));
const AdminModificationListPage = lazy(() => import('./admin/pages/modifications/ModificationListPage'));
const AdminPriceOverrideListPage = lazy(() => import('./admin/pages/hotels/PriceOverrideListPage'));
const AdminSupportListPage = lazy(() => import('./admin/pages/support/SupportListPage'));
const AdminAuditLogPage = lazy(() => import('./admin/pages/audit/AuditLogPage'));
const AdminAnalyticsPage = lazy(() => import('./admin/pages/analytics/AnalyticsPage'));

const PartnerLayout = lazy(() => import('./partner/components/layout/PartnerLayout'));
const PartnerDashboardPage = lazy(() => import('./partner/pages/PartnerDashboardPage'));
const PartnerHotelsPage = lazy(() => import('./partner/pages/PartnerHotelsPage'));
const PartnerRoomsPage = lazy(() => import('./partner/pages/PartnerRoomsPage'));
const PartnerBookingsPage = lazy(() => import('./partner/pages/PartnerBookingsPage'));

const adminFallback = <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Loading admin…</div>;
const partnerFallback = <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Loading partner portal...</div>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<ClientLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/hotel/:slug" element={<HotelDetailPage />} />
                <Route path="/booking/:roomTypeId" element={<BookingPage />} />
                <Route path="/payment/:bookingCode" element={<PaymentPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/bookings" element={<MyBookingsPage />} />
                <Route path="/bookings/:bookingCode" element={<BookingDetailPage />} />
                <Route path="/bookings/:bookingCode/modify" element={<ModifyBookingPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/auth/callback" element={<SocialCallbackPage />} />
              </Route>
              <Route path="/admin" element={<Suspense fallback={adminFallback}><AdminLayout /></Suspense>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Suspense fallback={adminFallback}><AdminDashboardPage /></Suspense>} />
                <Route path="analytics" element={<Suspense fallback={adminFallback}><AdminAnalyticsPage /></Suspense>} />
                <Route path="locations" element={<Suspense fallback={adminFallback}><AdminLocationListPage /></Suspense>} />
                <Route path="hotels" element={<Suspense fallback={adminFallback}><AdminHotelListPage /></Suspense>} />
                <Route path="hotels/:hotelId/rooms" element={<Suspense fallback={adminFallback}><AdminRoomTypeListPage /></Suspense>} />
                <Route path="bookings" element={<Suspense fallback={adminFallback}><AdminBookingListPage /></Suspense>} />
                <Route path="payments" element={<Suspense fallback={adminFallback}><AdminPaymentListPage /></Suspense>} />
                <Route path="refunds" element={<Suspense fallback={adminFallback}><AdminRefundListPage /></Suspense>} />
                <Route path="policies" element={<Suspense fallback={adminFallback}><AdminPolicyListPage /></Suspense>} />
                <Route path="transfers" element={<Suspense fallback={adminFallback}><AdminTransferListPage /></Suspense>} />
                <Route path="coupons" element={<Suspense fallback={adminFallback}><AdminCouponListPage /></Suspense>} />
                <Route path="reviews" element={<Suspense fallback={adminFallback}><AdminReviewListPage /></Suspense>} />
                <Route path="modifications" element={<Suspense fallback={adminFallback}><AdminModificationListPage /></Suspense>} />
                <Route path="hotels/:hotelId/rooms/:roomTypeId/price-overrides" element={<Suspense fallback={adminFallback}><AdminPriceOverrideListPage /></Suspense>} />
                <Route path="users" element={<Suspense fallback={adminFallback}><AdminUserListPage /></Suspense>} />
                <Route path="support" element={<Suspense fallback={adminFallback}><AdminSupportListPage /></Suspense>} />
                <Route path="audit-logs" element={<Suspense fallback={adminFallback}><AdminAuditLogPage /></Suspense>} />
              </Route>
              <Route path="/partner" element={<Suspense fallback={partnerFallback}><PartnerLayout /></Suspense>}>
                <Route index element={<Suspense fallback={partnerFallback}><PartnerDashboardPage /></Suspense>} />
                <Route path="hotels" element={<Suspense fallback={partnerFallback}><PartnerHotelsPage /></Suspense>} />
                <Route path="hotels/:hotelId/rooms" element={<Suspense fallback={partnerFallback}><PartnerRoomsPage /></Suspense>} />
                <Route path="bookings" element={<Suspense fallback={partnerFallback}><PartnerBookingsPage /></Suspense>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
