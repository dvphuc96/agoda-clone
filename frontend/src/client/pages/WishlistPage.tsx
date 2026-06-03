import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { getCollectionData, type Hotel } from '../../shared/api/hotels';
import { wishlistApi } from '../../shared/api/wishlist';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useI18n } from '../../shared/i18n/useI18n';
import HotelSearchCard from '../components/search/HotelSearchCard';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

export default function WishlistPage() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['wishlists'],
    queryFn: () => wishlistApi.list().then((r) => getCollectionData<Hotel>(r.data)),
    enabled: isAuthenticated,
  });

  const hotels = data ?? [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 md:px-8">
        <div className="space-y-6">
          <div className="skeleton h-8 w-48 rounded-full" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-2xl" />
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
            {t('wishlist.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('wishlist.subtitle')}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {hotels.length === 0 ? (
          <EmptyState
            icon={<Heart className="size-7 text-primary" />}
            title={t('wishlist.emptyTitle')}
            description={t('wishlist.emptyBody')}
            actionLabel={t('wishlist.exploreHotels')}
            actionTo="/search"
          />
        ) : (
          <div className="space-y-4">
            {hotels.map((hotel, idx) => (
              <HotelSearchCard key={hotel.id} hotel={hotel} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
