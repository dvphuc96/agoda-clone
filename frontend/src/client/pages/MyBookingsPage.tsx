import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, ArrowRight } from 'lucide-react';
import { bookingsApi } from '../../shared/api/bookings';
import { useI18n } from '../../shared/i18n/useI18n';
import { formatDateForLocale, formatVndForLocale } from '../../shared/i18n/format';

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

  const bookings = Array.isArray(data) ? data : (data?.data ?? []);
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

  if (isLoading) {
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

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
        <p role="alert" aria-live="polite" className="text-text-secondary">{t('common.error')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t('nav.myBookings')}</h1>

      {bookings.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-tab text-text-secondary">
            <CalendarDays className="size-6" />
          </div>
          <p className="font-semibold text-text">{t('booking.emptyTitle')}</p>
          <p className="mt-1 text-sm text-text-secondary">{t('booking.emptyBody')}</p>
          <Link
            to="/search"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover active:scale-[0.97]"
          >
            {t('booking.exploreHotels')}
            <ArrowRight className="size-4" />
          </Link>
        </div>
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
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
