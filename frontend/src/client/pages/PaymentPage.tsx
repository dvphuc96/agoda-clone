import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../../shared/api/bookings';
import { paymentsApi } from '../../shared/api/payments';
import { useI18n } from '../../shared/i18n';
import { formatDateForLocale, formatVndForLocale } from '../../shared/i18n/format';

export default function PaymentPage() {
  const { locale, t } = useI18n();
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if this is a callback from payment gateway
  const vnpayResponse = searchParams.get('vnp_ResponseCode');
  const momoResult = searchParams.get('resultCode');
  const paymentResult = searchParams.get('payment');
  const isCallback = vnpayResponse !== null || momoResult !== null || paymentResult !== null;

  const paymentSuccess = isCallback
    ? (paymentResult ? paymentResult === 'success' : (vnpayResponse === '00' || momoResult === '0'))
    : null;

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingCode],
    queryFn: () => bookingsApi.get(bookingCode!).then(r => r.data),
    enabled: !!bookingCode,
  });

  const handlePayment = async (method: 'vnpay' | 'momo') => {
    if (!booking) return;
    setError('');
    setLoading(true);
    try {
      const result = await paymentsApi.create(booking.id, method);
      if (!result.data.payment_url) {
        setError(t('payment.createFailure'));
        return;
      }
      // Redirect to payment gateway
      window.location.href = result.data.payment_url;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t('payment.createFailure'));
    } finally {
      setLoading(false);
    }
  };

  const statusLabels = {
    pending: t('status.pending'),
    confirmed: t('status.confirmed'),
    cancelled: t('status.cancelled'),
    completed: t('status.completed'),
    success: t('status.success'),
    failed: t('status.failed'),
    refunded: t('status.refunded'),
  };
  const knownStatusLabel = booking?.status && Object.prototype.hasOwnProperty.call(statusLabels, booking.status)
    ? statusLabels[booking.status as keyof typeof statusLabels]
    : t('status.unknown');

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-tab rounded w-1/2 mx-auto" />
          <div className="h-48 bg-tab rounded-2xl" />
        </div>
      </div>
    );
  }

  // Payment callback result
  if (isCallback && paymentSuccess !== null) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-surface rounded-2xl shadow-sm p-8">
          {paymentSuccess ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-text mb-2">{t('payment.success')}</h1>
              <p className="text-sm text-text-secondary mb-2">
                {t('payment.successBody', { code: bookingCode || '' })}
              </p>
              <p className="text-sm text-text-secondary mb-6">{t('payment.successEmail')}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to={`/bookings/${bookingCode}`}
                  className="min-w-0 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm break-words hover:bg-blue-700 transition-colors"
                >
                  {t('common.viewDetails')}
                </Link>
                <Link
                  to="/"
                  className="min-w-0 bg-tab text-text-secondary px-6 py-2.5 rounded-lg font-semibold text-sm break-words hover:bg-border transition-colors"
                >
                  {t('payment.backHome')}
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-text mb-2">{t('payment.failed')}</h1>
              <p className="text-sm text-text-secondary mb-6">
                {t('payment.failedBody')}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => window.location.href = `/payment/${bookingCode}`}
                  className="min-w-0 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm break-words hover:bg-blue-700 transition-colors"
                >
                  {t('common.retry')}
                </button>
                <Link
                  to={`/bookings/${bookingCode}`}
                  className="min-w-0 bg-tab text-text-secondary px-6 py-2.5 rounded-lg font-semibold text-sm break-words hover:bg-border transition-colors"
                >
                  {t('payment.viewBooking')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Payment method selection
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text tracking-tight">{t('payment.title')}</h1>
        <p className="text-sm text-text-secondary mt-1">{t('payment.subtitle')}</p>
      </div>

      {/* Booking Summary */}
      {booking && (
        <div className="bg-surface rounded-2xl shadow-sm p-5 mb-6">
          <h3 className="font-bold text-text mb-3">{t('booking.summary')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
              <span className="text-text-secondary">{t('booking.bookingCode')}</span>
              <span className="font-medium text-text">{booking.booking_code}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
              <span className="text-text-secondary">{t('booking.hotel')}</span>
              <span className="font-medium text-text">{booking.room_type?.hotel?.name}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
              <span className="text-text-secondary">{t('booking.roomType')}</span>
              <span className="font-medium text-text">{booking.room_type?.name}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
              <span className="text-text-secondary">{t('searchForm.checkIn')}</span>
              <span className="font-medium text-text">{formatDateForLocale(booking.check_in, locale)}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
              <span className="text-text-secondary">{t('searchForm.checkOut')}</span>
              <span className="font-medium text-text">{formatDateForLocale(booking.check_out, locale)}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
              <span className="text-text-secondary">{t('booking.status')}</span>
              <span className="font-medium text-text">{knownStatusLabel}</span>
            </div>
            <div className="border-t border-border/50 pt-2 mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1">
              <span className="font-bold text-text">{t('booking.total')}</span>
              <span className="text-xl font-bold text-primary">{formatVndForLocale(booking.total_price, locale)}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4 break-words">
          {error}
        </div>
      )}

      {/* Payment Methods */}
      <div className="space-y-3">
        <h3 className="font-bold text-text text-sm">{t('payment.method')}</h3>

        {/* VNPay */}
        <button
          onClick={() => handlePayment('vnpay')}
          disabled={loading}
          className="w-full min-w-0 bg-surface rounded-2xl shadow-sm border border-border/50 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 hover:border-primary hover:shadow-md transition-all disabled:opacity-50 text-left"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
            💳
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-text break-words">{t('payment.payWithVnpay')}</div>
            <div className="text-xs text-text-secondary mt-0.5 break-words">{t('payment.vnpayDescription')}</div>
          </div>
          <div className="min-w-0 text-primary font-semibold text-sm break-words sm:text-right">{t('payment.continuePayment')}</div>
        </button>

        {/* MoMo */}
        <button
          onClick={() => handlePayment('momo')}
          disabled={loading}
          className="w-full min-w-0 bg-surface rounded-2xl shadow-sm border border-border/50 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 hover:border-primary hover:shadow-md transition-all disabled:opacity-50 text-left"
        >
          <div className="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
            📱
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-text break-words">{t('payment.payWithMomo')}</div>
            <div className="text-xs text-text-secondary mt-0.5 break-words">{t('payment.momoDescription')}</div>
          </div>
          <div className="min-w-0 text-primary font-semibold text-sm break-words sm:text-right">{t('payment.continuePayment')}</div>
        </button>
      </div>

      {loading && (
        <div className="text-center mt-4 text-sm text-text-secondary">
          {t('payment.redirecting')}
        </div>
      )}
    </div>
  );
}
