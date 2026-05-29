import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RotateCcw, SlidersHorizontal, Star } from 'lucide-react';
import { useI18n } from '../../../shared/i18n';

const starOptions = [1, 2, 3, 4, 5];
const propertyTypes = [
  { value: 'hotel', labelKey: 'search.typeHotel' },
  { value: 'villa', labelKey: 'search.typeVilla' },
  { value: 'resort', labelKey: 'search.typeResort' },
  { value: 'apartment', labelKey: 'search.typeApartment' },
] as const;
const amenitiesList = ['wifi', 'pool', 'spa', 'restaurant', 'parking', 'gym', 'air_conditioning', 'breakfast'] as const;

export default function SearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
  const [priceMin, setPriceMin] = useState(searchParams.get('price_min') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('price_max') || '');
  const [star, setStar] = useState(Number(searchParams.get('star')) || 0);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    if (priceMin) params.set('price_min', priceMin);
    else params.delete('price_min');
    if (priceMax) params.set('price_max', priceMax);
    else params.delete('price_max');
    if (star) params.set('star', String(star));
    else params.delete('star');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setStar(0);
    setSelectedTypes([]);
    setSelectedAmenities([]);
    const params = new URLSearchParams(searchParams);
    params.delete('price_min');
    params.delete('price_max');
    params.delete('star');
    setSearchParams(params);
  };

  return (
    <aside className="w-full shrink-0 space-y-4 md:w-[284px]">
      <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-text">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            {t('search.filters')}
          </h3>
          <button onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary">
            <RotateCcw className="h-3.5 w-3.5" />
            {t('search.clear')}
          </button>
        </div>
        <div className="border-t border-border pt-4">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-text-secondary">{t('search.priceRange')}</h4>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder={t('search.minPrice')}
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="w-full rounded-md border border-border bg-[#fffaf2] px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <span className="text-text-secondary">-</span>
          <input
            type="number"
            placeholder={t('search.maxPrice')}
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="w-full rounded-md border border-border bg-[#fffaf2] px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-text-secondary">{t('search.starRating')}</h4>
        <div className="grid grid-cols-2 gap-2">
          {starOptions.map(s => (
            <button
              key={s}
              onClick={() => setStar(star === s ? 0 : s)}
              className={`inline-flex items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                star === s
                  ? 'bg-navy text-white'
                  : 'border border-border bg-[#fffaf2] text-text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              <Star className="h-3.5 w-3.5 fill-current" />
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
                checked={selectedTypes.includes(type.value)}
                onChange={() => toggleType(type.value)}
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
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedAmenities.includes(amenity)
                  ? 'bg-primary text-white'
                  : 'bg-[#fffaf2] text-text-secondary ring-1 ring-border hover:text-primary'
              }`}
            >
              {t(`amenities.${amenity}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-2 border-t border-border pt-4">
        <button
          onClick={applyFilters}
          className="flex-1 rounded-md bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0b5f59]"
        >
          {t('search.applyFilters')}
        </button>
        <button
          onClick={clearFilters}
          className="rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-tab"
        >
          {t('search.clear')}
        </button>
      </div>
      </div>
    </aside>
  );
}
