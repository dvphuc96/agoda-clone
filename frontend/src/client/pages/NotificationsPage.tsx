import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BellOff } from 'lucide-react';
import { notificationsApi } from '../../shared/api/notifications';
import { useI18n } from '../../shared/i18n/useI18n';
import { formatDateForLocale } from '../../shared/i18n/format';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

export default function NotificationsPage() {
  const { locale, t } = useI18n();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then(r => r.data),
  });

  const notifications = Array.isArray(data) ? data : data?.data ?? [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        <p className="sr-only">{t('common.loading')}</p>
        <div className="space-y-4">
          <div className="skeleton h-8 w-1/4 rounded" />
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t('notifications.title')}</h1>
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
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
        <Link to="/" className="transition-spring-fast hover:text-primary">{t('common.home')}</Link>
        <span>/</span>
        <span className="text-text">{t('notifications.title')}</span>
      </div>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t('notifications.title')}</h1>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<BellOff className="size-7 text-primary" />}
          title={t('notifications.emptyTitle')}
          description={t('notifications.emptyBody')}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="overflow-hidden rounded-2xl bg-shadow/5 p-1.5 ring-1 ring-black/5 transition-spring-fast hover:ring-black/10">
              <div className="rounded-[calc(1rem-6px)] bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {n.type || '—'}
                      </span>
                      {n.status && (
                        <span className="inline-block rounded-full bg-tab px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                          {n.status}
                        </span>
                      )}
                    </div>
                    <p className="break-words text-sm text-text">
                      {n.message || (n.payload?.message as string | undefined) || '—'}
                    </p>
                    {n.booking?.booking_code && (
                      <Link
                        to={`/bookings/${n.booking.booking_code}`}
                        className="mt-2 inline-block text-xs font-medium text-primary transition-spring-fast hover:underline"
                      >
                        {t('common.viewDetails')} →
                      </Link>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-xs text-text-secondary">
                    {n.sent_at ? formatDateForLocale(n.sent_at, locale) : t('notifications.noDate')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
