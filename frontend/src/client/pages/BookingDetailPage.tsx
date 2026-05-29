import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { bookingsApi } from '../../shared/api/bookings';
import { useI18n } from '../../shared/i18n';
import { formatDateForLocale, formatVndForLocale } from '../../shared/i18n/format';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
};

export default function BookingDetailPage() {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const queryClient = useQueryClient();
  const { locale, t } = useI18n();

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', bookingCode],
    queryFn: () => bookingsApi.get(bookingCode!).then(r => r.data),
    enabled: !!bookingCode,
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancel(bookingCode!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingCode] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });

  const bookingStatusLabels = {
    pending: t('status.pending'),
    confirmed: t('status.confirmed'),
    cancelled: t('status.cancelled'),
    completed: t('status.completed'),
  };

  const paymentStatusLabels = {
    pending: t('status.pending'),
    success: t('status.success'),
    failed: t('status.failed'),
    refunded: t('status.refunded'),
  };

  const getBookingStatusLabel = (status: string) =>
    Object.prototype.hasOwnProperty.call(bookingStatusLabels, status)
      ? bookingStatusLabels[status as keyof typeof bookingStatusLabels]
      : t('status.unknown');

  const getPaymentStatusLabel = (status: string) =>
    Object.prototype.hasOwnProperty.call(paymentStatusLabels, status)
      ? paymentStatusLabels[status as keyof typeof paymentStatusLabels]
      : t('status.unknown');

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <p className="sr-only">{t('common.loading')}</p>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-tab rounded w-1/3" />
          <div className="h-64 bg-tab rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
        <div className="text-5xl mb-4" aria-hidden="true">😕</div>
        <h2 className="text-xl font-bold text-text">{t('booking.notFoundTitle')}</h2>
        <Link to="/bookings" className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg font-semibold text-sm">
          {t('booking.backToList')}
        </Link>
      </div>
    );
  }

  const latestPayment = booking.payments?.[0];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link to="/" className="hover:text-primary transition-colors">{t('common.home')}</Link>
        <span>/</span>
        <Link to="/bookings" className="hover:text-primary transition-colors">{t('nav.myBookings')}</Link>
        <span>/</span>
        <span className="text-text">#{booking.booking_code}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">{t('booking.detailTitle')}</h1>
          <div className="text-sm text-text-secondary mt-1">{t('booking.bookingCode')}: #{booking.booking_code}</div>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusColors[booking.status] || 'bg-tab text-text-secondary'}`}>
          {getBookingStatusLabel(booking.status)}
        </span>
      </div>

      {/* Booking Details Card */}
      <div className="bg-surface rounded-2xl shadow-sm p-6 mb-4">
        <h3 className="font-bold text-text mb-4">{t('booking.details')}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-text-secondary">{t('booking.hotel')}</div>
            <div className="font-medium text-text mt-0.5">{booking.room_type?.hotel?.name || t('booking.defaultHotelName')}</div>
          </div>
          <div>
            <div className="text-text-secondary">{t('booking.roomType')}</div>
            <div className="font-medium text-text mt-0.5">{booking.room_type?.name || t('booking.defaultRoomName')}</div>
          </div>
          <div>
            <div className="text-text-secondary">{t('hotel.checkIn')}</div>
            <div className="font-medium text-text mt-0.5">{formatDateForLocale(booking.check_in, locale)}</div>
          </div>
          <div>
            <div className="text-text-secondary">{t('hotel.checkOut')}</div>
            <div className="font-medium text-text mt-0.5">{formatDateForLocale(booking.check_out, locale)}</div>
          </div>
          <div>
            <div className="text-text-secondary">{t('booking.nights', { count: booking.nights })}</div>
            <div className="font-medium text-text mt-0.5">{booking.nights}</div>
          </div>
          <div>
            <div className="text-text-secondary">{t('hotel.guests')}</div>
            <div className="font-medium text-text mt-0.5">
              {booking.guests === 1 ? t('searchForm.guestsSingular') : t('searchForm.guestsPlural', { count: booking.guests })}
            </div>
          </div>
          {booking.special_requests && (
            <div className="col-span-2">
              <div className="text-text-secondary">{t('booking.specialRequests')}</div>
              <div className="font-medium text-text mt-0.5">{booking.special_requests}</div>
            </div>
          )}
        </div>

        <div className="border-t border-border/50 mt-4 pt-4 flex justify-between items-center">
          <span className="font-bold text-text">{t('booking.total')}</span>
          <span className="text-xl font-bold text-primary">{formatVndForLocale(booking.total_price, locale)}</span>
        </div>
      </div>

      {/* Payment Info Card */}
      {latestPayment && (
        <div className="bg-surface rounded-2xl shadow-sm p-6 mb-4">
          <h3 className="font-bold text-text mb-4">{t('payment.info')}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-text-secondary">{t('payment.method')}</div>
              <div className="font-medium text-text mt-0.5">
                {latestPayment.payment_method === 'vnpay' ? 'VNPAY' : 'MoMo'}
              </div>
            </div>
            <div>
              <div className="text-text-secondary">{t('booking.status')}</div>
              <span className={`inline-block mt-0.5 px-3 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[latestPayment.status] || 'bg-tab text-text-secondary'}`}>
                {getPaymentStatusLabel(latestPayment.status)}
              </span>
            </div>
            {latestPayment.paid_at && (
              <div>
                <div className="text-text-secondary">{t('payment.paidAt')}</div>
                <div className="font-medium text-text mt-0.5">{formatDateForLocale(latestPayment.paid_at, locale)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        {booking.status === 'pending' && (
          <>
            <Link
              to={`/payment/${booking.booking_code}`}
              className="bg-gold text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors"
            >
              {t('booking.payNow')}
            </Link>
            <button
              type="button"
              onClick={() => {
                if (confirm(t('booking.cancelConfirm'))) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
              className="bg-red-50 text-red-600 border border-red-200 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {cancelMutation.isPending ? t('booking.cancelling') : t('booking.cancel')}
            </button>
          </>
        )}
        <Link
          to="/bookings"
          className="bg-tab text-text-secondary px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-border transition-colors"
        >
          {t('booking.back')}
        </Link>
      </div>

      {cancelMutation.isError && (
        <div role="alert" aria-live="polite" className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 break-words">
          {t('booking.cancelFailure')}
        </div>
      )}
    </div>
  );
}
