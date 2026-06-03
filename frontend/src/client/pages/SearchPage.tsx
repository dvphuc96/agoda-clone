import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { CalendarDays, Filter, MapPin, PencilLine, UsersRound, X } from 'lucide-react';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import MapPanel from '../components/search/MapPanel';
import MapViewToggle, { type ViewMode } from '../components/search/MapViewToggle';
import { getCollectionData, hotelsApi, type Location } from '../../shared/api/hotels';
import { useI18n } from '../../shared/i18n/useI18n';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { t } = useI18n();
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => hotelsApi.getLocations().then(r => getCollectionData<Location>(r.data)),
  });

  const location = searchParams.get('location') || '';
  const locationId = locations.find(item => item.slug === location)?.id;
  const locationLabel = locations.find(item => item.slug === location)?.name ?? location;
  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';
  const guests = searchParams.get('guests') || '';
  const guestCount = Number(guests);
  const guestLabel = guestCount === 1
    ? t('searchForm.guestsSingular')
    : t('searchForm.guestsPlural', { count: Number.isFinite(guestCount) && guestCount > 0 ? guestCount : guests });

  return (
    <div className="bg-bg pt-16 md:pt-20">
      <div className="border-b border-border bg-warm-surface px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/" className="mr-2 text-lg font-semibold tracking-tight text-navy">
              Go<span className="text-primary">Stay</span>
            </Link>
            {location && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-text">
                <MapPin className="size-3.5 text-primary" />
                {locationLabel}
              </span>
            )}
            {checkIn && checkOut && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-text">
                <CalendarDays className="size-3.5 text-primary" />
                {checkIn} - {checkOut}
              </span>
            )}
            {guests && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-text">
                <UsersRound className="size-3.5 text-primary" />
                {guestLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <MapViewToggle value={viewMode} onChange={setViewMode} />
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-spring-fast hover:text-primary-hover">
              <PencilLine className="size-4" />
              {t('search.editSearch')}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        {/* Header + mobile filter toggle */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-text">{t('search.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('search.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-text transition-spring-fast hover:bg-tab md:hidden"
        >
          {showFilters ? <X className="size-4" /> : <Filter className="size-4" />}
          {showFilters ? t('search.hideFilters') : t('search.showFilters')}
        </button>

        {/* Mobile filter overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
            <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-xl animate-[slide-up_300ms_cubic-bezier(0.32,0.72,0,1)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-text">{t('search.filters')}</h2>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="flex size-8 items-center justify-center rounded-full bg-tab text-text-secondary transition-spring-fast hover:text-text"
                >
                  <X className="size-4" />
                </button>
              </div>
              <SearchFilters />
            </div>
          </div>
        )}

        {/* List view - original layout */}
        {viewMode === 'list' && (
          <div className="flex flex-col items-stretch gap-6 md:flex-row md:items-start">
            <div className="hidden w-full md:block md:w-auto md:shrink-0">
              <SearchFilters />
            </div>
            <div className="min-w-0 w-full">
              <SearchResults />
            </div>
          </div>
        )}

        {/* Map view - full width map */}
        {viewMode === 'map' && (
          <MapPanel className="h-[calc(100vh-220px)] min-h-[480px]" locationId={locationId} />
        )}

        {/* Split view - left map + right results */}
        {viewMode === 'split' && (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex flex-col gap-4 lg:w-1/2">
              <MapPanel className="h-[calc(100vh-280px)] min-h-[400px] lg:min-h-[520px]" locationId={locationId} />
            </div>
            <div className="min-w-0 lg:w-1/2">
              <SearchResults />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
