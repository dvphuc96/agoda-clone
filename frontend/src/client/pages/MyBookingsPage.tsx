import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../../shared/api/bookings';
import { useI18n } from '../../shared/i18n';
import { formatDateForLocale, formatVndForLocale } from '../../shared/i18n/format';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
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
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-text tracking-tight mb-6">{t('nav.myBookings')}</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface rounded-2xl shadow-sm h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
        <p role="alert" aria-live="polite" className="text-text-secondary">{t('common.error')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold text-text tracking-tight mb-6">{t('nav.myBookings')}</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-text font-semibold">{t('booking.emptyTitle')}</p>
          <p className="text-sm text-text-secondary mt-1">{t('booking.emptyBody')}</p>
          <Link
            to="/search"
            className="inline-block mt-4 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            {t('booking.exploreHotels')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <Link
              key={booking.id}
              to={`/bookings/${booking.booking_code}`}
              className="block bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-text">{booking.room_type?.hotel?.name || t('booking.hotel')}</div>
                  <div className="text-sm text-text-secondary mt-1">{booking.room_type?.name || t('booking.roomType')}</div>
                  <div className="text-sm text-text-secondary mt-1">
                    📅 {formatDateForLocale(booking.check_in, locale)} → {formatDateForLocale(booking.check_out, locale)} · {t('booking.nights', { count: booking.nights })}
                  </div>
                  <div className="text-sm text-text-secondary mt-1">👥 {t('searchForm.guestsPlural', { count: booking.guests })}</div>
                  <div className="text-xs text-text-secondary mt-2">
                    {t('booking.createdAt')}: {formatDateForLocale(booking.created_at, locale)}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-tab text-text-secondary'}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                  <div className="text-lg font-bold text-primary mt-2">{formatVndForLocale(booking.total_price, locale)}</div>
                  <div className="text-[11px] text-text-secondary">{t('booking.bookingCode')}: #{booking.booking_code}</div>
                  <div className="text-[11px] font-semibold text-primary mt-1">{t('common.viewDetails')}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
