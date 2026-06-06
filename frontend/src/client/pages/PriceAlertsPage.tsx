import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Trash2, ToggleLeft, ToggleRight, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { priceAlertsApi, type PriceAlert } from '../../shared/api/priceAlerts';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useI18n } from '../../shared/i18n/useI18n';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

export default function PriceAlertsPage() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['price-alerts'],
    queryFn: () => priceAlertsApi.list().then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => priceAlertsApi.delete(id),
    onSuccess: () => {
      toast.success(t('priceAlerts.alertDeleted'));
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => priceAlertsApi.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });

  const alerts = data ?? [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 md:px-8">
        <div className="space-y-6">
          <div className="skeleton h-8 w-48 rounded-full" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 md:px-8">
        <ErrorState
          title={t('common.error')}
          onRetry={() => window.location.reload()}
          retryLabel={t('common.retry')}
        />
      </div>
    );
  }

  return (
    <div className="bg-bg">
      <div className="border-b border-border/50 bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-text">
            {t('priceAlerts.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('priceAlerts.subtitle')}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {alerts.length === 0 ? (
          <EmptyState
            icon={<Bell className="size-7 text-primary" />}
            title={t('priceAlerts.noAlerts')}
            description={t('priceAlerts.noAlertsDesc')}
            actionLabel={t('priceAlerts.exploreHotels')}
            actionTo="/search"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert: PriceAlert) => (
              <div
                key={alert.id}
                className={`rounded-2xl border bg-surface p-5 transition-shadow hover:shadow-md ${
                  alert.is_active ? 'border-border/60' : 'border-border/30 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/hotel/${alert.hotel.slug}`}
                    className="min-w-0 flex-1"
                  >
                    <h3 className="truncate font-semibold text-text hover:text-primary">
                      {alert.hotel.name}
                    </h3>
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      alert.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {alert.is_active ? t('priceAlerts.active') : t('priceAlerts.inactive')}
                  </span>
                </div>

                {alert.hotel.star_rating > 0 && (
                  <div className="mt-1 flex items-center gap-0.5">
                    {Array.from({ length: alert.hotel.star_rating }).map((_, i) => (
                      <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                )}

                <p className="mt-1 truncate text-sm text-text-secondary">
                  {alert.hotel.address}
                </p>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{t('priceAlerts.yourTarget')}</span>
                    <span className="font-semibold text-primary">
                      {formatPrice(alert.target_price)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/40 pt-3">
                  <button
                    onClick={() => toggleMutation.mutate(alert.id)}
                    disabled={toggleMutation.isPending}
                    className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg hover:text-text"
                    title={alert.is_active ? t('priceAlerts.inactive') : t('priceAlerts.active')}
                  >
                    {alert.is_active ? (
                      <ToggleRight className="size-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="size-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(t('priceAlerts.deleteConfirm'))) {
                        deleteMutation.mutate(alert.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                    title={t('priceAlerts.delete')}
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
