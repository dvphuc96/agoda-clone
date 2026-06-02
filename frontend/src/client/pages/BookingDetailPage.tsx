import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, AlertTriangle, Clock, CreditCard, RotateCcw, Star } from 'lucide-react';
import { bookingsApi } from '../../shared/api/bookings';
import { refundsApi } from '../../shared/api/refunds';
import { useI18n } from '../../shared/i18n/useI18n';
import { formatDateForLocale, formatVndForLocale } from '../../shared/i18n/format';

const statusColors: Record<string, string> = {
  pending: 'bg-badge-pending-bg text-badge-pending-text',
  confirmed: 'bg-badge-confirmed-bg text-badge-confirmed-text',
  cancelled: 'bg-badge-cancelled-bg text-badge-cancelled-text',
  completed: 'bg-badge-confirmed-bg text-badge-confirmed-text',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-badge-pending-bg text-badge-pending-text',
  success: 'bg-badge-paid-bg text-badge-paid-text',
  failed: 'bg-badge-cancelled-bg text-badge-cancelled-text',
  refunded: 'bg-badge-refunded-bg text-badge-refunded-text',
};

export default function BookingDetailPage() {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const queryClient = useQueryClient();
  const { locale, t } = useI18n();
  const [reason, setReason] = useState('');
  const [showRefundForm, setShowRefundForm] = useState(false);

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

  const refundMutation = useMutation({
    mutationFn: () => refundsApi.requestCancel(bookingCode!, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingCode] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setShowRefundForm(false);
      setReason('');
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

  const refundStatusLabels = {
    pending: t('booking.refundPending'),
    approved: t('booking.refundApproved'),
    rejected: t('booking.refundRejected'),
    processed: t('booking.refundProcessed'),
  };

  const getBookingStatusLabel = (status: string) =>
    Object.prototype.hasOwnProperty.call(bookingStatusLabels, status)
      ? bookingStatusLabels[status as keyof typeof bookingStatusLabels]
      : t('status.unknown');

  const getPaymentStatusLabel = (status: string) =>
    Object.prototype.hasOwnProperty.call(paymentStatusLabels, status)
      ? paymentStatusLabels[status as keyof typeof paymentStatusLabels]
      : t('status.unknown');

  const getRefundStatusLabel = (status: string) =>
    Object.prototype.hasOwnProperty.call(refundStatusLabels, status)
      ? refundStatusLabels[status as keyof typeof refundStatusLabels]
      : status;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        <p className="sr-only">{t('common.loading')}</p>
        <div className="space-y-4">
          <div className="skeleton h-8 w-1/3 rounded" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-badge-cancelled-bg text-badge-cancelled-text">
          <AlertTriangle className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-text">{t('booking.notFoundTitle')}</h2>
        <Link to="/bookings" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97]">
          <ArrowLeft className="size-4" />
          {t('booking.backToList')}
        </Link>
      </div>
    );
  }

  const latestPayment = booking.payments?.[0];
  const cancellation = booking.cancellation;
  const latestRefund = booking.refunds?.[0];
  const hasActiveRefund = booking.refunds?.some((refund) => ['pending', 'approved', 'processed'].includes(refund.status)) ?? false;
  const canCancelByPolicy = cancellation?.can_cancel ?? false;
  const canCancelPending = booking.status === 'pending' && canCancelByPolicy && !hasActiveRefund;
  const canRequestRefund = booking.status === 'confirmed' && canCancelByPolicy && !hasActiveRefund;
  const showNotEligible = ['pending', 'confirmed'].includes(booking.status) && !canCancelByPolicy;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
        <Link to="/" className="transition-spring-fast hover:text-primary">{t('common.home')}</Link>
        <span>/</span>
        <Link to="/bookings" className="transition-spring-fast hover:text-primary">{t('nav.myBookings')}</Link>
        <span>/</span>
        <span className="text-text">#{booking.booking_code}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">{t('booking.detailTitle')}</h1>
          <div className="mt-1 text-sm text-text-secondary">{t('booking.bookingCode')}: #{booking.booking_code}</div>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${statusColors[booking.status] || 'bg-tab text-text-secondary'}`}>
          {getBookingStatusLabel(booking.status)}
        </span>
      </div>

      {/* Booking Details Card */}
      <div className="mb-4 overflow-hidden rounded-2xl bg-shadow/5 p-1.5 ring-1 ring-black/5">
        <div className="rounded-[calc(1rem-6px)] bg-surface p-6">
          <h3 className="mb-4 font-bold text-text">{t('booking.details')}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-text-secondary">{t('booking.hotel')}</div>
              <div className="mt-0.5 font-medium text-text">{booking.room_type?.hotel?.name || t('booking.defaultHotelName')}</div>
            </div>
            <div>
              <div className="text-text-secondary">{t('booking.roomType')}</div>
              <div className="mt-0.5 font-medium text-text">{booking.room_type?.name || t('booking.defaultRoomName')}</div>
            </div>
            <div>
              <div className="text-text-secondary">{t('hotel.checkIn')}</div>
              <div className="mt-0.5 font-medium text-text">{formatDateForLocale(booking.check_in, locale)}</div>
            </div>
            <div>
              <div className="text-text-secondary">{t('hotel.checkOut')}</div>
              <div className="mt-0.5 font-medium text-text">{formatDateForLocale(booking.check_out, locale)}</div>
            </div>
            <div>
              <div className="text-text-secondary">{t('booking.nights', { count: booking.nights })}</div>
              <div className="mt-0.5 font-medium text-text">{booking.nights}</div>
            </div>
            <div>
              <div className="text-text-secondary">{t('hotel.guests')}</div>
              <div className="mt-0.5 font-medium text-text">
                {booking.guests === 1 ? t('searchForm.guestsSingular') : t('searchForm.guestsPlural', { count: booking.guests })}
              </div>
            </div>
            {booking.special_requests && (
              <div className="col-span-2">
                <div className="text-text-secondary">{t('booking.specialRequests')}</div>
                <div className="mt-0.5 font-medium text-text">{booking.special_requests}</div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
            <span className="font-bold text-text">{t('booking.total')}</span>
            <span className="text-xl font-bold text-primary">{formatVndForLocale(booking.total_price, locale)}</span>
          </div>
        </div>
      </div>

      {/* Cancellation Policy Card */}
      <div className="mb-4 overflow-hidden rounded-2xl bg-shadow/5 p-1.5 ring-1 ring-black/5">
        <div className="rounded-[calc(1rem-6px)] bg-surface p-6">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-text">
            <Clock className="size-4 text-text-secondary" />
            {t('booking.cancellationPolicy')}
          </h3>
          {cancellation ? (
            <div className="space-y-2 text-sm">
              {cancellation.policy?.is_non_refundable ? (
                <p className="font-medium text-destructive">{t('booking.nonRefundable')}</p>
              ) : (
                <>
                  <p className="text-text-secondary">{t('booking.cancellationPolicyDesc')}</p>
                  {cancellation.policy && (
                    <p className="text-text">
                      {cancellation.policy.free_cancellation_hours > 0
                        ? t('booking.freeCancelBefore', { hours: cancellation.policy.free_cancellation_hours })
                        : t('booking.nonRefundable')}
                    </p>
                  )}
                  {cancellation.fee_amount !== null && Number(cancellation.fee_amount) > 0 && (
                    <p className="text-badge-pending-text">{t('booking.cancellationFee', { fee: formatVndForLocale(cancellation.fee_amount, locale) })}</p>
                  )}
                </>
              )}
              {cancellation.reason && <p className="text-text-secondary">{cancellation.reason}</p>}
              {cancellation.refund_amount !== null && (
                <p className="text-text">
                  {t('booking.refundStatus')}: {formatVndForLocale(cancellation.refund_amount, locale)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">{t('booking.cancellationPolicyDesc')}</p>
          )}
        </div>
      </div>

      {latestRefund && (
        <div className="mb-4 overflow-hidden rounded-2xl bg-shadow/5 p-1.5 ring-1 ring-black/5">
          <div className="rounded-[calc(1rem-6px)] bg-surface p-6">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-text">
              <RotateCcw className="size-4 text-text-secondary" />
              {t('booking.refundStatus')}
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-text">{getRefundStatusLabel(latestRefund.status)}</p>
              <p className="text-text-secondary">{formatVndForLocale(latestRefund.amount, locale)}</p>
              {latestRefund.reason && <p className="text-text-secondary">{latestRefund.reason}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Payment Info Card */}
      {latestPayment && (
        <div className="mb-4 overflow-hidden rounded-2xl bg-shadow/5 p-1.5 ring-1 ring-black/5">
          <div className="rounded-[calc(1rem-6px)] bg-surface p-6">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-text">
              <CreditCard className="size-4 text-text-secondary" />
              {t('payment.info')}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-text-secondary">{t('payment.method')}</div>
                <div className="mt-0.5 font-medium text-text">
                  {latestPayment.payment_method === 'vnpay' ? 'VNPAY' : 'MoMo'}
                </div>
              </div>
              <div>
                <div className="text-text-secondary">{t('booking.status')}</div>
                <span className={`mt-0.5 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${paymentStatusColors[latestPayment.status] || 'bg-tab text-text-secondary'}`}>
                  {getPaymentStatusLabel(latestPayment.status)}
                </span>
              </div>
              {latestPayment.paid_at && (
                <div>
                  <div className="text-text-secondary">{t('payment.paidAt')}</div>
                  <div className="mt-0.5 font-medium text-text">{formatDateForLocale(latestPayment.paid_at, locale)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Refund Request Form */}
      {showRefundForm && canRequestRefund && (
        <div className="mb-4 rounded-2xl border border-badge-pending-bg bg-surface p-6">
          <h3 className="mb-3 font-bold text-text">{t('booking.requestRefund')}</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="refund-reason" className="mb-1 block text-sm font-medium text-text">
                {t('booking.refundReason')}
              </label>
              <textarea
                id="refund-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('booking.refundReasonPlaceholder')}
                rows={3}
                className="w-full rounded-xl border border-border bg-warm-surface px-3 py-2 text-sm outline-none transition-spring-fast focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            {refundMutation.isError && (
              <p role="alert" className="text-sm text-destructive">{t('booking.refundRequestFailure')}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!reason.trim()) return;
                  refundMutation.mutate();
                }}
                disabled={refundMutation.isPending || !reason.trim()}
                className="rounded-full bg-destructive px-5 py-2 text-sm font-semibold text-white transition-spring-fast hover:bg-destructive-hover active:scale-[0.97] disabled:opacity-50"
              >
                {refundMutation.isPending ? t('booking.submittingRefund') : t('booking.submitRefundRequest')}
              </button>
              <button
                type="button"
                onClick={() => { setShowRefundForm(false); setReason(''); }}
                className="rounded-full bg-tab px-5 py-2 text-sm font-semibold text-text-secondary transition-spring-fast hover:bg-border"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {booking.status === 'completed' && (
          <button
            type="button"
            onClick={() => {
              const hotelId = (booking.room_type as { hotel?: { id?: number } })?.hotel?.id;
              if (hotelId) {
                // Navigate to hotel page where user can write a review
                window.location.href = `/hotel/${(booking.room_type as { hotel?: { slug?: string } })?.hotel?.slug ?? ''}#reviews`;
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition-spring-fast hover:bg-amber-600 active:scale-[0.97]"
          >
            <Star className="size-4" />
            {t('reviews.writeReview')}
          </button>
        )}
        {booking.status === 'pending' && !showRefundForm && (
          <>
            <Link
              to={`/payment/${booking.booking_code}`}
              className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-spring-fast hover:bg-gold-hover active:scale-[0.97]"
            >
              {t('booking.payNow')}
            </Link>
            {canCancelPending && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(t('booking.cancelConfirm'))) {
                    cancelMutation.mutate();
                  }
                }}
                disabled={cancelMutation.isPending}
                className="rounded-full border border-badge-cancelled-bg bg-badge-cancelled-bg px-6 py-2.5 text-sm font-semibold text-badge-cancelled-text transition-spring-fast hover:opacity-80 active:scale-[0.97] disabled:opacity-50"
              >
                {cancelMutation.isPending ? t('booking.cancelling') : t('booking.cancel')}
              </button>
            )}
          </>
        )}
        {canRequestRefund && !showRefundForm && (
          <button
            type="button"
            onClick={() => setShowRefundForm(true)}
            className="rounded-full border border-badge-pending-bg bg-badge-pending-bg px-6 py-2.5 text-sm font-semibold text-badge-pending-text transition-spring-fast hover:opacity-80 active:scale-[0.97]"
          >
            {t('booking.requestRefund')}
          </button>
        )}
        {showNotEligible && (
          <p className="text-sm text-text-secondary">{t('booking.notEligibleForCancel')}</p>
        )}
        <Link
          to="/bookings"
          className="flex items-center gap-2 rounded-full bg-tab px-6 py-2.5 text-sm font-semibold text-text-secondary transition-spring-fast hover:bg-border active:scale-[0.97]"
        >
          <ArrowLeft className="size-4" />
          {t('booking.back')}
        </Link>
      </div>

      {cancelMutation.isError && (
        <div role="alert" aria-live="polite" className="mt-4 break-words rounded-lg border border-badge-cancelled-bg bg-badge-cancelled-bg p-3 text-sm text-badge-cancelled-text">
          {t('booking.cancelFailure')}
        </div>
      )}
    </div>
  );
}
