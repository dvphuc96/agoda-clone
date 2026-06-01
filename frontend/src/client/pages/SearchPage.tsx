import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { CalendarDays, Filter, MapPin, PencilLine, UsersRound, X } from 'lucide-react';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import { getCollectionData, hotelsApi, type Location } from '../../shared/api/hotels';
import { useI18n } from '../../shared/i18n/useI18n';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useI18n();
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => hotelsApi.getLocations().then(r => getCollectionData<Location>(r.data)),
  });

  const location = searchParams.get('location') || '';
  const locationLabel = locations.find(item => item.slug === location)?.name ?? location;
  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';
  const guests = searchParams.get('guests') || '';
  const guestCount = Number(guests);
  const guestLabel = guestCount === 1
    ? t('searchForm.guestsSingular')
    : t('searchForm.guestsPlural', { count: Number.isFinite(guestCount) && guestCount > 0 ? guestCount : guests });

  return (
    <div className="bg-bg">
      <div className="border-b border-border bg-[#fffaf2] px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/" className="mr-2 text-lg font-semibold tracking-tight text-navy">
              Go<span className="text-primary">Stay</span>
            </Link>
            {location && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-text">
                <MapPin className="size-3.5 text-primary" />
                {locationLabel}
              </span>
            )}
            {checkIn && checkOut && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-text">
                <CalendarDays className="size-3.5 text-primary" />
                {checkIn} - {checkOut}
              </span>
            )}
            {guests && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-text">
                <UsersRound className="size-3.5 text-primary" />
                {guestLabel}
              </span>
            )}
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-[#0b5f59]">
            <PencilLine className="size-4" />
            {t('search.editSearch')}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-text">{t('search.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('search.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-white px-4 py-3 text-sm font-semibold text-text transition-colors hover:bg-tab md:hidden"
        >
          {showFilters ? <X className="size-4" /> : <Filter className="size-4" />}
          {showFilters ? t('search.hideFilters') : t('search.showFilters')}
        </button>

        <div className="flex flex-col items-stretch gap-6 md:flex-row md:items-start">
          <div className={`${showFilters ? 'block' : 'hidden'} w-full md:block md:w-auto md:shrink-0`}>
            <SearchFilters />
          </div>
          <div className="min-w-0 w-full">
            <SearchResults />
          </div>
        </div>
      </div>
    </div>
  );
}
