import { useSearchParams } from 'react-router-dom';
import { ArrowDownAZ, BadgeCheck, Star } from 'lucide-react';
import { useI18n } from '../../../shared/i18n';

const sortOptions = [
  { value: '', labelKey: 'search.sortRecommended' },
  { value: 'price_asc', labelKey: 'search.sortPriceAsc' },
  { value: 'price_desc', labelKey: 'search.sortPriceDesc' },
  { value: 'rating', labelKey: 'search.sortRating' },
] as const;

export default function SortBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
  const currentSort = searchParams.get('sort') || '';

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="mr-1 inline-flex items-center gap-2 text-sm font-semibold text-text">
        <ArrowDownAZ className="h-4 w-4 text-primary" />
        {t('search.sortBy')}
      </span>
      {sortOptions.map(opt => (
        <button
          key={opt.value}
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            if (opt.value) params.set('sort', opt.value);
            else params.delete('sort');
            params.set('page', '1');
            setSearchParams(params);
          }}
          className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
            currentSort === opt.value
              ? 'bg-navy text-white'
              : 'border border-border bg-white text-text-secondary hover:border-primary hover:text-primary'
          }`}
        >
          {opt.value === 'rating' && <Star className="h-3.5 w-3.5" />}
          {opt.value === '' && <BadgeCheck className="h-3.5 w-3.5" />}
          {t(opt.labelKey)}
        </button>
      ))}
    </div>
  );
}
