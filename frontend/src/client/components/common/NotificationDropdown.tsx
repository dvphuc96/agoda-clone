import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, BellOff, CheckCheck } from 'lucide-react';
import { notificationsApi } from '../../../shared/api/notifications';
import { useI18n } from '../../../shared/i18n/useI18n';
import { formatDateForLocale } from '../../../shared/i18n/format';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const { locale, t } = useI18n();

  const { data: badgeData } = useQuery({
    queryKey: ['notifications', 'badge'],
    queryFn: () => notificationsApi.getUnreadCount().then(r => r.data.count),
    refetchInterval: 30_000,
    staleTime: 30_000,
  });

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then(r => r.data),
    enabled: open,
  });

  const notifications = Array.isArray(data) ? data : data?.data ?? [];
  const unreadCount = badgeData ?? 0;

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: invalidateAll,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: invalidateAll,
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClickItem = (n: typeof notifications[number]) => {
    if (!n.is_read) {
      markAsReadMutation.mutate(n.id);
    }
    if (n.booking?.booking_code) {
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative grid size-9 place-items-center rounded-full text-text-secondary transition-all duration-200 hover:bg-tab/60 hover:text-primary"
        aria-label={t('notifications.title')}
      >
        <Bell className="size-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border/50 bg-white shadow-xl sm:w-96 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
              <h3 className="text-sm font-semibold text-navy">{t('notifications.title')}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-7 place-items-center rounded-lg text-text-secondary hover:bg-tab/60"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8">
                  <BellOff className="size-6 text-text-secondary/40" />
                  <p className="text-sm text-text-secondary">{t('notifications.emptyBody')}</p>
                </div>
              ) : (
                <div className="divide-y divide-border/20">
                  {notifications.map((n) => {
                    const innerBody = (
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-1.5">
                            {!n.is_read && (
                              <span className="size-2 shrink-0 rounded-full bg-primary" aria-label={t('notifications.unread')} />
                            )}
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${n.is_read ? 'bg-tab text-text-secondary' : 'bg-primary/10 text-primary'}`}>
                              {n.type || '—'}
                            </span>
                          </div>
                          <p className={`text-sm ${n.is_read ? 'text-text-secondary' : 'font-medium text-text'}`}>
                            {n.message || (n.payload?.message as string | undefined) || '—'}
                          </p>
                          {n.booking?.booking_code && (
                            <span className="mt-1 inline-block text-xs font-medium text-primary group-hover:underline">
                              {t('common.viewDetails')} →
                            </span>
                          )}
                        </div>
                        <span className="whitespace-nowrap text-[10px] text-text-secondary">
                          {n.sent_at ? formatDateForLocale(n.sent_at, locale) : t('notifications.noDate')}
                        </span>
                      </div>
                    );

                    if (n.booking?.booking_code) {
                      return (
                        <Link
                          key={n.id}
                          to={`/bookings/${n.booking.booking_code}`}
                          onClick={() => handleClickItem(n)}
                          className={`group block px-4 py-3 transition-colors hover:bg-tab/30 ${n.is_read ? 'opacity-60' : ''}`}
                        >
                          {innerBody}
                        </Link>
                      );
                    }

                    return (
                      <button
                        type="button"
                        key={n.id}
                        onClick={() => handleClickItem(n)}
                        className={`group block w-full px-4 py-3 text-left transition-colors hover:bg-tab/30 ${n.is_read ? 'opacity-60' : ''}`}
                      >
                        {innerBody}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t border-border/30 px-4 py-2">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-spring-fast hover:underline disabled:opacity-50"
                >
                  <CheckCheck className="size-3.5" />
                  {t('notifications.markAllRead')}
                </button>
              ) : (
                <span />
              )}
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-primary transition-spring-fast hover:underline"
              >
                {t('common.viewDetails')} →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
