import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { bookingsApi } from '../../shared/api/bookings';
import { paymentsApi } from '../../shared/api/payments';
import { useI18n } from '../../shared/i18n/useI18n';
import { formatDateForLocale, formatVndForLocale } from '../../shared/i18n/format';

export default function PaymentPage() {
  const { locale, t } = useI18n();
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="space-y-4">
          <div className="skeleton mx-auto h-8 w-1/2 rounded-full" />
          <div className="skeleton h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Payment callback result
  if (isCallback && paymentSuccess !== null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl bg-surface p-8 shadow-sm ring-1 ring-black/5">
          {paymentSuccess ? (
            <>
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="size-8 text-success" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-text">{t('payment.success')}</h1>
              <p className="mb-2 text-sm text-text-secondary">
                {t('payment.successBody', { code: bookingCode || '' })}
              </p>
              <p className="mb-6 text-sm text-text-secondary">{t('payment.successEmail')}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to={`/bookings/${bookingCode}`}
                  className="min-w-0 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover"
                >
                  {t('common.viewDetails')}
                </Link>
                <Link
                  to="/"
                  className="min-w-0 rounded-full bg-tab px-6 py-2.5 text-sm font-semibold text-text-secondary transition-spring-fast hover:bg-border"
                >
                  {t('payment.backHome')}
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="size-8 text-destructive" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-text">{t('payment.failed')}</h1>
              <p className="mb-6 text-sm text-text-secondary">
                {t('payment.failedBody')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.location.href = `/payment/${bookingCode}`}
                  className="min-w-0 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover"
                >
                  {t('common.retry')}
                </button>
                <Link
                  to={`/bookings/${bookingCode}`}
                  className="min-w-0 rounded-full bg-tab px-6 py-2.5 text-sm font-semibold text-text-secondary transition-spring-fast hover:bg-border"
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
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-text">{t('payment.title')}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t('payment.subtitle')}</p>
      </div>

      {/* Booking Summary */}
      {booking && (
        <div className="mb-6 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <h3 className="mb-3 font-bold text-text">{t('booking.summary')}</h3>
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
            <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-border/50 pt-2">
              <span className="font-bold text-text">{t('booking.total')}</span>
              <span className="text-xl font-bold text-primary">{formatVndForLocale(booking.total_price, locale)}</span>
            </div>
            {booking.discount_amount > 0 && (
              <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-emerald-600 dark:text-emerald-400">
                <span className="font-medium">{t('coupons.discount')}</span>
                <span className="font-medium">-{formatVndForLocale(booking.discount_amount, locale)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div role="alert" aria-live="polite" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 break-words">
          {error}
        </div>
      )}

      {/* Payment Methods */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text">{t('payment.method')}</h3>

        {/* VNPay */}
        <button
          type="button"
          onClick={() => handlePayment('vnpay')}
          disabled={loading}
          className="w-full min-w-0 overflow-hidden rounded-2xl bg-shadow/5 p-1.5 text-left ring-1 ring-black/5 transition-spring hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
        >
          <div className="flex flex-col items-stretch gap-3 rounded-[calc(1rem-6px)] bg-surface p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#003f93]/10">
              <span className="text-lg font-extrabold text-[#003f93]">VNPAY</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-text break-words">{t('payment.payWithVnpay')}</div>
              <div className="mt-0.5 text-xs text-text-secondary break-words">{t('payment.vnpayDescription')}</div>
            </div>
            <div className="min-w-0 text-sm font-semibold text-primary break-words sm:text-right">{t('payment.continuePayment')}</div>
          </div>
        </button>

        {/* MoMo */}
        <button
          type="button"
          onClick={() => handlePayment('momo')}
          disabled={loading}
          className="w-full min-w-0 overflow-hidden rounded-2xl bg-shadow/5 p-1.5 text-left ring-1 ring-black/5 transition-spring hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
        >
          <div className="flex flex-col items-stretch gap-3 rounded-[calc(1rem-6px)] bg-surface p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#a50064]/10">
              <span className="text-lg font-extrabold text-[#a50064]">MoMo</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-text break-words">{t('payment.payWithMomo')}</div>
              <div className="mt-0.5 text-xs text-text-secondary break-words">{t('payment.momoDescription')}</div>
            </div>
            <div className="min-w-0 text-sm font-semibold text-primary break-words sm:text-right">{t('payment.continuePayment')}</div>
          </div>
        </button>
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-text-secondary">
          <Loader2 className="size-4 animate-spin" />
          {t('payment.redirecting')}
        </div>
      )}
    </div>
  );
}
