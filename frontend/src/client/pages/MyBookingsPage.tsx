import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, CarFront, Plane, CalendarX } from 'lucide-react';
import { bookingsApi } from '../../shared/api/bookings';
import { transfersApi } from '../../shared/api/transfers';
import { useI18n } from '../../shared/i18n/useI18n';
import { formatDateForLocale, formatVndForLocale } from '../../shared/i18n/format';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import BookingCountdown from '../components/BookingCountdown';

const statusColors: Record<string, string> = {
  pending: 'bg-badge-pending-bg text-badge-pending-text',
  confirmed: 'bg-badge-confirmed-bg text-badge-confirmed-text',
  cancelled: 'bg-badge-cancelled-bg text-badge-cancelled-text',
  completed: 'bg-badge-confirmed-bg text-badge-confirmed-text',
};

export default function MyBookingsPage() {
  const { locale, t } = useI18n();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.list().then(r => r.data),
  });
  const transfers = useQuery({
    queryKey: ['my-transfer-bookings'],
    queryFn: () => transfersApi.bookings().then(r => r.data),
  });

  const bookings = Array.isArray(data) ? data : (data?.data ?? []);
  const transferBookings = transfers.data?.data ?? [];
  const statusLabels = {
    pending: t('status.pending'),
    confirmed: t('status.confirmed'),
    cancelled: t('status.cancelled'),
    completed: t('status.completed'),
  };
  const getStatusLabel = (status: string) =>
    Object.prototype.hasOwnProperty.call(statusLabels, status)
      ? statusLabels[status as keyof typeof statusLabels]
      : t('status.unknown');

  if (isLoading || transfers.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t('nav.myBookings')}</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || transfers.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t('nav.myBookings')}</h1>
        <ErrorState
          title={t('common.error')}
          onRetry={() => window.location.reload()}
          retryLabel={t('common.retry')}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t('nav.myBookings')}</h1>

      {bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarX className="size-7 text-primary" />}
          title={t('booking.emptyTitle')}
          description={t('booking.emptyBody')}
          actionLabel={t('booking.exploreHotels')}
          actionTo="/search"
        />
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <Link
              key={booking.id}
              to={`/bookings/${booking.booking_code}`}
              className="group block overflow-hidden rounded-2xl bg-shadow/5 p-1.5 ring-1 ring-black/5 transition-spring hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="rounded-[calc(1rem-6px)] bg-surface p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-text">{booking.room_type?.hotel?.name || t('booking.hotel')}</div>
                    <div className="mt-1 text-sm text-text-secondary">{booking.room_type?.name || t('booking.roomType')}</div>
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary">
                      <CalendarDays className="size-3.5 shrink-0" />
                      {formatDateForLocale(booking.check_in, locale)} → {formatDateForLocale(booking.check_out, locale)} · {t('booking.nights', { count: booking.nights })}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                      <Users className="size-3.5 shrink-0" />
                      {t('searchForm.guestsPlural', { count: booking.guests })}
                    </div>
                    <div className="mt-2 text-xs text-text-secondary">
                      {t('booking.createdAt')}: {formatDateForLocale(booking.created_at, locale)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[booking.status] || 'bg-tab text-text-secondary'}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                    <div className="mt-2 text-lg font-bold text-primary">{formatVndForLocale(booking.total_price, locale)}</div>
                    <div className="text-[11px] text-text-secondary">{t('booking.bookingCode')}: #{booking.booking_code}</div>
                    <div className="mt-1 text-[11px] font-semibold text-primary transition-spring-fast group-hover:underline">{t('common.viewDetails')}</div>
                    {booking.status === 'pending' && (booking as { expires_at?: string }).expires_at && (
                      <div className="mt-2">
                        <BookingCountdown
                          expiresAt={(booking as { expires_at?: string }).expires_at}
                          compact
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 border-t border-border pt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold tracking-tight text-text">{t('transfers.myTransfers')}</h2>
        </div>
        {transferBookings.length === 0 ? (
          <div className="rounded-2xl bg-shadow/5 px-6 py-10 text-center ring-1 ring-black/5">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-tab text-text-secondary">
              <CarFront className="size-5" />
            </div>
            <p className="text-sm font-semibold text-text">{t('transfers.emptyBookings')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transferBookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl bg-shadow/5 p-1.5 ring-1 ring-black/5">
                <div className="rounded-[calc(1rem-6px)] bg-surface p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="font-bold text-text">{booking.vehicle_type?.name ?? t('transfers.nav')}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                        <Plane className="size-3.5 shrink-0" />
                        {booking.direction === 'airport_to_hotel' ? booking.airport_name : booking.hotel?.name} → {booking.direction === 'airport_to_hotel' ? booking.hotel?.name : booking.airport_name}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary">
                        <CalendarDays className="size-3.5 shrink-0" />
                        {formatDateForLocale(booking.pickup_datetime, locale)}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                        <Users className="size-3.5 shrink-0" />
                        {t('transfers.passengersLabel', { count: booking.passengers })}
                      </div>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[booking.status] || 'bg-tab text-text-secondary'}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                      <div className="mt-2 text-lg font-bold text-primary">{formatVndForLocale(booking.total_price, locale)}</div>
                      <div className="text-[11px] text-text-secondary">{t('transfers.bookingCode')}: #{booking.booking_code}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
