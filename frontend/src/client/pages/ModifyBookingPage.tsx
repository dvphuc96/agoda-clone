import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { ArrowLeft, AlertTriangle, Calendar, Check } from 'lucide-react';
import { bookingsApi } from '../../shared/api/bookings';
import { modificationsApi } from '../../shared/api/modifications';
import { useI18n } from '../../shared/i18n/useI18n';
import { formatDateForLocale, formatVndForLocale } from '../../shared/i18n/format';

export default function ModifyBookingPage() {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { locale, t } = useI18n();

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', bookingCode],
    queryFn: () => bookingsApi.get(bookingCode!).then(r => r.data),
    enabled: !!bookingCode,
  });

  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [newGuests, setNewGuests] = useState(1);

  const canModify = useMemo(() => {
    if (!booking) return false;
    if (!['pending', 'confirmed'].includes(booking.status)) return false;
    const checkIn = new Date(booking.check_in);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkIn > today;
  }, [booking]);

  const newNights = useMemo(() => {
    if (!newCheckIn || !newCheckOut) return 0;
    const inDate = new Date(newCheckIn);
    const outDate = new Date(newCheckOut);
    const diff = outDate.getTime() - inDate.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [newCheckIn, newCheckOut]);

  const pricePerNight = booking?.room_type?.price_per_night
    ? Number(booking.room_type.price_per_night)
    : 0;

  const newTotalPrice = useMemo(() => {
    return pricePerNight * newNights;
  }, [pricePerNight, newNights]);

  const priceDiff = useMemo(() => {
    if (!booking) return 0;
    return newTotalPrice - Number(booking.total_price);
  }, [booking, newTotalPrice]);

  const isFormValid = useMemo(() => {
    if (!newCheckIn || !newCheckOut || newNights < 1) return false;
    const inDate = new Date(newCheckIn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inDate < today) return false;
    return true;
  }, [newCheckIn, newCheckOut, newNights]);

  const modifyMutation = useMutation({
    mutationFn: () => modificationsApi.requestModification(bookingCode!, {
      new_check_in: newCheckIn,
      new_check_out: newCheckOut,
      new_guests: newGuests,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingCode] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      navigate(`/bookings/${bookingCode}`);
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
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

  if (!canModify) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-badge-cancelled-bg text-badge-cancelled-text">
          <AlertTriangle className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-text">{t('bookingModification.notEligibleTitle')}</h2>
        <p className="mt-2 text-sm text-text-secondary">{t('bookingModification.notEligibleBody')}</p>
        <Link to={`/bookings/${bookingCode}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97]">
          <ArrowLeft className="size-4" />
          {t('booking.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
        <Link to="/" className="transition-spring-fast hover:text-primary">{t('common.home')}</Link>
        <span>/</span>
        <Link to="/bookings" className="transition-spring-fast hover:text-primary">{t('nav.myBookings')}</Link>
        <span>/</span>
        <Link to={`/bookings/${bookingCode}`} className="transition-spring-fast hover:text-primary">#{booking.booking_code}</Link>
        <span>/</span>
        <span className="text-text">{t('bookingModification.pageTitle')}</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t('bookingModification.pageTitle')}</h1>

      {/* Current Booking */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-shadow/5 p-1.5 ring-1 ring-black/5">
        <div className="rounded-[calc(1rem-6px)] bg-surface p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-text">
            <Calendar className="size-4 text-text-secondary" />
            {t('bookingModification.currentBooking')}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
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
          </div>
          <div className="mt-4 border-t border-border/50 pt-3 text-sm">
            <span className="text-text-secondary">{t('booking.total')}: </span>
            <span className="font-bold text-primary">{formatVndForLocale(booking.total_price, locale)}</span>
          </div>
        </div>
      </div>

      {/* Modification Form */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-shadow/5 p-1.5 ring-1 ring-black/5">
        <div className="rounded-[calc(1rem-6px)] bg-surface p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-text">
            <Calendar className="size-4 text-text-secondary" />
            {t('bookingModification.newDetails')}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="new-check-in" className="mb-1 block text-sm font-medium text-text">
                  {t('hotel.checkIn')}
                </label>
                <input
                  id="new-check-in"
                  type="date"
                  value={newCheckIn}
                  onChange={(e) => setNewCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border border-border bg-warm-surface px-3 py-2.5 text-sm outline-none transition-spring-fast focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="new-check-out" className="mb-1 block text-sm font-medium text-text">
                  {t('hotel.checkOut')}
                </label>
                <input
                  id="new-check-out"
                  type="date"
                  value={newCheckOut}
                  onChange={(e) => setNewCheckOut(e.target.value)}
                  min={newCheckIn || new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border border-border bg-warm-surface px-3 py-2.5 text-sm outline-none transition-spring-fast focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label htmlFor="new-guests" className="mb-1 block text-sm font-medium text-text">
                {t('hotel.guests')}
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewGuests(Math.max(1, newGuests - 1))}
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-spring-fast hover:bg-border"
                  aria-label="Decrease guests"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium text-text">
                  {newGuests}
                </span>
                <button
                  type="button"
                  onClick={() => setNewGuests(newGuests + 1)}
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-spring-fast hover:bg-border"
                  aria-label="Increase guests"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Preview */}
      {isFormValid && (
        <div className="mb-6 overflow-hidden rounded-2xl bg-primary/5 p-1.5 ring-1 ring-primary/20">
          <div className="rounded-[calc(1rem-6px)] bg-surface p-6">
            <h3 className="mb-3 font-bold text-text">{t('bookingModification.pricePreview')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('bookingModification.newNights', { count: newNights })}</span>
                <span className="font-medium text-text">{newNights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('bookingModification.pricePerNight')}</span>
                <span className="font-medium text-text">{formatVndForLocale(pricePerNight, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('bookingModification.newTotal')}</span>
                <span className="font-bold text-primary">{formatVndForLocale(newTotalPrice, locale)}</span>
              </div>
              {priceDiff !== 0 && (
                <div className="border-t border-border/50 pt-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('bookingModification.priceDifference')}</span>
                    <span className={`font-bold ${priceDiff > 0 ? 'text-badge-pending-text' : 'text-success'}`}>
                      {priceDiff > 0 ? '+' : ''}{formatVndForLocale(Math.abs(priceDiff), locale)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {priceDiff > 0
                      ? t('bookingModification.additionalPayment')
                      : t('bookingModification.refundNote')
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto-approve notice for pending bookings */}
      {booking.status === 'pending' && (
        <div className="mb-4 rounded-xl bg-success/10 p-4 text-sm text-success">
          <div className="flex items-center gap-2">
            <Check className="size-4" />
            {t('bookingModification.autoApproveNotice')}
          </div>
        </div>
      )}

      {booking.status === 'confirmed' && (
        <div className="mb-4 rounded-xl bg-badge-pending-bg p-4 text-sm text-badge-pending-text">
          {t('bookingModification.requiresApprovalNotice')}
        </div>
      )}

      {modifyMutation.isError && (
        <div role="alert" aria-live="polite" className="mb-4 rounded-lg border border-badge-cancelled-bg bg-badge-cancelled-bg p-3 text-sm text-badge-cancelled-text">
          {t('bookingModification.submitFailure')}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            if (!isFormValid) return;
            modifyMutation.mutate();
          }}
          disabled={!isFormValid || modifyMutation.isPending}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97] disabled:opacity-50"
        >
          {modifyMutation.isPending ? t('common.loading') : t('bookingModification.submitRequest')}
        </button>
        <Link
          to={`/bookings/${bookingCode}`}
          className="flex items-center gap-2 rounded-full bg-tab px-6 py-2.5 text-sm font-semibold text-text-secondary transition-spring-fast hover:bg-border active:scale-[0.97]"
        >
          <ArrowLeft className="size-4" />
          {t('booking.back')}
        </Link>
      </div>
    </div>
  );
}
