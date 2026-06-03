import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { hotelsApi, type HotelSearchParams } from '../../../shared/api/hotels';
import { useI18n } from '../../../shared/i18n/useI18n';
import HotelSearchCard from './HotelSearchCard';
import SortBar from './SortBar';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();

  const params: HotelSearchParams = {
    location: searchParams.get('location') || undefined,
    check_in: searchParams.get('check_in') || undefined,
    check_out: searchParams.get('check_out') || undefined,
    guests: searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined,
    star: searchParams.get('star') ? Number(searchParams.get('star')) : undefined,
    price_min: searchParams.get('price_min') ? Number(searchParams.get('price_min')) : undefined,
    price_max: searchParams.get('price_max') ? Number(searchParams.get('price_max')) : undefined,
    types: searchParams.get('types') || undefined,
    amenities: searchParams.get('amenities') || undefined,
    sort: searchParams.get('sort') || undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['search-hotels', params],
    queryFn: () => hotelsApi.searchHotels(params).then(r => r.data),
  });

  const goToPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(page));
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <SortBar />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1">
        <ErrorState
          title={t('common.error')}
          description={t('search.errorBody')}
          onRetry={() => void refetch()}
          retryLabel={t('common.retry')}
        />
      </div>
    );
  }

  const hotels = data?.data ?? [];
  const currentPage = data?.meta?.current_page ?? data?.current_page ?? 1;
  const lastPage = data?.meta?.last_page ?? data?.last_page ?? 1;
  const total = data?.meta?.total ?? data?.total ?? 0;

  return (
    <div className="flex-1">
      <div className="mb-4 rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{t('search.resultsEyebrow')}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text">{t('search.resultsTitle')}</h1>
          </div>
          {total > 0 && (
            <p className="text-sm text-text-secondary">
              {t('search.resultsCount', { count: total })}
            </p>
          )}
        </div>
      </div>

      <SortBar />

      {hotels.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-7 text-primary" />}
          title={t('search.emptyTitle')}
          description={t('search.emptyBody')}
        />
      ) : (
        <>
          <div className="space-y-4">
            {hotels.map((hotel, idx) => (
              <HotelSearchCard key={hotel.id} hotel={hotel} index={idx} />
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold transition-colors hover:bg-tab disabled:opacity-40"
              >
                {t('common.previous')}
              </button>
              {Array.from({ length: lastPage }, (_, i) => i + 1).map(page => (
                <button
                  type="button"
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`size-9 rounded-md text-sm font-semibold transition-colors ${
                    page === currentPage
                      ? 'bg-navy text-white'
                      : 'border border-border bg-white text-text-secondary hover:bg-tab'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold transition-colors hover:bg-tab disabled:opacity-40"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
