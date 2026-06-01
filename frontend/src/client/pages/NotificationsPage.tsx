import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../../shared/api/notifications';
import { useI18n } from '../../shared/i18n/useI18n';
import { formatDateForLocale } from '../../shared/i18n/format';

export default function NotificationsPage() {
  const { locale, t } = useI18n();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then(r => r.data),
  });

  const notifications = Array.isArray(data) ? data : data?.data ?? [];

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <p className="sr-only">{t('common.loading')}</p>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-tab rounded w-1/4" />
          <div className="h-32 bg-tab rounded-2xl" />
          <div className="h-32 bg-tab rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
        <div className="text-5xl mb-4" aria-hidden="true">⚠️</div>
        <h2 className="text-xl font-bold text-text">{t('common.error')}</h2>
        <Link to="/" className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg font-semibold text-sm">
          {t('common.home')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link to="/" className="hover:text-primary transition-colors">{t('common.home')}</Link>
        <span>/</span>
        <span className="text-text">{t('notifications.title')}</span>
      </div>

      <h1 className="text-2xl font-bold text-text tracking-tight mb-6">{t('notifications.title')}</h1>

      {notifications.length === 0 ? (
        <div className="bg-surface rounded-2xl shadow-sm p-10 text-center">
          <div className="text-4xl mb-3" aria-hidden="true">🔔</div>
          <h3 className="text-lg font-semibold text-text">{t('notifications.emptyTitle')}</h3>
          <p className="text-sm text-text-secondary mt-1">{t('notifications.emptyBody')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="bg-surface rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {n.type || '—'}
                    </span>
                    {n.status && (
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                        {n.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text break-words">
                    {n.message || (n.payload?.message as string | undefined) || '—'}
                  </p>
                  {n.booking?.booking_code && (
                    <Link
                      to={`/bookings/${n.booking.booking_code}`}
                      className="inline-block mt-2 text-xs font-medium text-primary hover:underline"
                    >
                      {t('common.viewDetails')} →
                    </Link>
                  )}
                </div>
                <div className="text-xs text-text-secondary whitespace-nowrap">
                  {n.sent_at ? formatDateForLocale(n.sent_at, locale) : t('notifications.noDate')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
