import { useReducer, useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RotateCcw, SlidersHorizontal, Star, Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/client';
import { useI18n } from '../../../shared/i18n/useI18n';

const starOptions = [1, 2, 3, 4, 5];
const propertyTypes = [
  { value: 'hotel', labelKey: 'search.typeHotel' },
  { value: 'villa', labelKey: 'search.typeVilla' },
  { value: 'resort', labelKey: 'search.typeResort' },
  { value: 'apartment', labelKey: 'search.typeApartment' },
] as const;
const amenitiesList = ['wifi', 'pool', 'spa', 'restaurant', 'parking', 'gym', 'air_conditioning', 'breakfast'] as const;
const priceBounds = { min: 1000, max: 10000, step: 500 };
const priceFormatter = new Intl.NumberFormat('vi-VN');

function clampPrice(value: number): number {
  return Math.min(priceBounds.max, Math.max(priceBounds.min, value));
}

function priceValue(value: string, fallback: number): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? clampPrice(numericValue) : fallback;
}

function formatPrice(value: string, fallback: number): string {
  return priceFormatter.format(priceValue(value, fallback)) + 'đ';
}

interface Suggestion {
  id: number;
  name: string;
  slug: string;
  star_rating: number;
  address: string;
  thumbnail: string | null;
}

interface FilterState {
  q: string;
  priceMin: string;
  priceMax: string;
  star: number;
  selectedTypes: string[];
  selectedAmenities: string[];
}

type FilterAction =
  | { type: 'setQuery'; value: string }
  | { type: 'setPriceMin'; value: string }
  | { type: 'setPriceMax'; value: string }
  | { type: 'toggleStar'; value: number }
  | { type: 'toggleType'; value: string }
  | { type: 'toggleAmenity'; value: string }
  | { type: 'clear' };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'setQuery':
      return { ...state, q: action.value };
    case 'setPriceMin':
      return { ...state, priceMin: action.value };
    case 'setPriceMax':
      return { ...state, priceMax: action.value };
    case 'toggleStar':
      return { ...state, star: state.star === action.value ? 0 : action.value };
    case 'toggleType':
      return {
        ...state,
        selectedTypes: state.selectedTypes.includes(action.value)
          ? state.selectedTypes.filter((type) => type !== action.value)
          : [...state.selectedTypes, action.value],
      };
    case 'toggleAmenity':
      return {
        ...state,
        selectedAmenities: state.selectedAmenities.includes(action.value)
          ? state.selectedAmenities.filter((amenity) => amenity !== action.value)
          : [...state.selectedAmenities, action.value],
      };
    case 'clear':
      return {
        q: '',
        priceMin: String(priceBounds.min),
        priceMax: String(priceBounds.max),
        star: 0,
        selectedTypes: [],
        selectedAmenities: [],
      };
    default:
      return state;
  }
}

export default function SearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(filterReducer, {
    q: searchParams.get('q') ?? '',
    priceMin: searchParams.get('price_min') || String(priceBounds.min),
    priceMax: searchParams.get('price_max') || String(priceBounds.max),
    star: Number(searchParams.get('star')) || 0,
    selectedTypes: searchParams.get('types')?.split(',').filter(Boolean) ?? [],
    selectedAmenities: searchParams.get('amenities')?.split(',').filter(Boolean) ?? [],
  });
  const minPriceValue = priceValue(state.priceMin, priceBounds.min);
  const maxPriceValue = priceValue(state.priceMax, priceBounds.max);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (state.q.trim().length < 2) {
      setDebouncedQ('');
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => setDebouncedQ(state.q.trim()), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [state.q]);

  const { data: suggestions = [] } = useQuery<Suggestion[]>({
    queryKey: ['search-suggest', debouncedQ],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Suggestion[] }>('/search/suggest', { params: { q: debouncedQ } });
      return res.data.data;
    },
    enabled: debouncedQ.length >= 2,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (debouncedQ.length >= 2) setShowSuggestions(true);
  }, [debouncedQ]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false);
    navigate(`/hotel/${slug}`);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    const trimmedQ = state.q.trim();
    if (trimmedQ) params.set('q', trimmedQ);
    else params.delete('q');
    params.set('price_min', String(minPriceValue));
    params.set('price_max', String(maxPriceValue));
    if (state.star) params.set('star', String(state.star));
    else params.delete('star');
    if (state.selectedTypes.length > 0) params.set('types', state.selectedTypes.join(','));
    else params.delete('types');
    if (state.selectedAmenities.length > 0) params.set('amenities', state.selectedAmenities.join(','));
    else params.delete('amenities');
    setSearchParams(params);
  };

  const clearFilters = () => {
    dispatch({ type: 'clear' });
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    params.delete('price_min');
    params.delete('price_max');
    params.delete('star');
    params.delete('types');
    params.delete('amenities');
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <aside className="w-full shrink-0 space-y-4 md:w-[284px]">
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-text">
            <SlidersHorizontal className="size-4 text-primary" />
            {t('search.filters')}
          </h3>
          <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary transition-spring-fast hover:text-primary">
            <RotateCcw className="size-3.5" />
            {t('search.clear')}
          </button>
        </div>
        <div className="border-t border-border pt-4">
        <div className="mb-5 border-b border-border pb-5">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-text-secondary">
            {t('search.hotelName')}
          </h4>
          <div ref={suggestRef} className="relative">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={state.q}
                onChange={e => dispatch({ type: 'setQuery', value: e.target.value })}
                onFocus={() => { if (debouncedQ.length >= 2 && suggestions.length > 0) setShowSuggestions(true); }}
                placeholder={t('search.hotelNamePlaceholder')}
                maxLength={100}
                className="w-full rounded-full border border-border bg-warm-surface pl-9 pr-4 py-2 text-sm text-text placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {state.q && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'setQuery', value: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            {showSuggestions && debouncedQ.length >= 2 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-white shadow-lg">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  {t('search.suggestedHotels')}
                </div>
                {suggestions.length === 0 ? (
                  <div className="px-3 py-3 text-center text-sm text-text-secondary">
                    {t('search.noSuggestions')}
                  </div>
                ) : (
                  <ul>
                    {suggestions.map(s => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(s.slug)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-warm-surface"
                        >
                          {s.thumbnail ? (
                            <img src={s.thumbnail} alt={s.name} className="size-9 shrink-0 rounded-lg object-cover" />
                          ) : (
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warm-surface">
                              <Search className="size-3.5 text-text-secondary" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-xs font-semibold text-text">{s.name}</span>
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-primary">
                                <Star className="size-2.5 fill-current" />
                                {s.star_rating}
                              </span>
                            </div>
                            <p className="truncate text-[10px] text-text-secondary">{s.address}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-text-secondary">{t('search.priceRange')}</h4>
          <span className="text-xs font-semibold text-primary">
            {formatPrice(state.priceMin, priceBounds.min)} - {formatPrice(state.priceMax, priceBounds.max)}
          </span>
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-warm-surface px-3 py-4">
          <div>
            <label htmlFor="price-min-range" className="mb-2 flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span>{t('search.minPrice')}</span>
              <span className="text-text">{formatPrice(state.priceMin, priceBounds.min)}</span>
            </label>
            <input
              id="price-min-range"
              aria-label="Giá tối thiểu"
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={priceBounds.step}
              value={minPriceValue}
              onChange={e => {
                const nextValue = Math.min(Number(e.target.value), maxPriceValue);
                dispatch({ type: 'setPriceMin', value: String(nextValue) });
              }}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label htmlFor="price-max-range" className="mb-2 flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span>{t('search.maxPrice')}</span>
              <span className="text-text">{formatPrice(state.priceMax, priceBounds.max)}</span>
            </label>
            <input
              id="price-max-range"
              aria-label="Giá tối đa"
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={priceBounds.step}
              value={maxPriceValue}
              onChange={e => {
                const nextValue = Math.max(Number(e.target.value), minPriceValue);
                dispatch({ type: 'setPriceMax', value: String(nextValue) });
              }}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-text-secondary">{t('search.starRating')}</h4>
        <div className="grid grid-cols-2 gap-2">
          {starOptions.map(s => (
            <button
              type="button"
              key={s}
              onClick={() => dispatch({ type: 'toggleStar', value: s })}
              className={`inline-flex items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-semibold transition-spring-fast active:scale-[0.95] ${
                state.star === s
                  ? 'bg-navy text-white'
                  : 'border border-border bg-warm-surface text-text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              <Star className="size-3.5 fill-current" />
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-text-secondary">{t('search.accommodationType')}</h4>
        <div className="space-y-2">
          {propertyTypes.map(type => (
            <label key={type.value} className="flex cursor-pointer items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={state.selectedTypes.includes(type.value)}
                onChange={() => dispatch({ type: 'toggleType', value: type.value })}
                className="accent-primary"
              />
              {t(type.labelKey)}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-text-secondary">{t('search.amenities')}</h4>
        <div className="flex flex-wrap gap-2">
          {amenitiesList.map(amenity => (
            <button
              type="button"
              key={amenity}
              onClick={() => dispatch({ type: 'toggleAmenity', value: amenity })}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-spring-fast active:scale-[0.95] ${
                state.selectedAmenities.includes(amenity)
                  ? 'bg-primary text-white'
                  : 'bg-warm-surface text-text-secondary ring-1 ring-border hover:text-primary'
              }`}
            >
              {t(`amenities.${amenity}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={applyFilters}
          className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-white transition-spring-fast active:scale-[0.97] hover:bg-primary-hover"
        >
          {t('search.applyFilters')}
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition-spring-fast hover:bg-tab"
        >
          {t('search.clear')}
        </button>
      </div>
      </div>
    </aside>
  );
}
