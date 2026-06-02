import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, X } from 'lucide-react';
import { useI18n } from '../../../shared/i18n/useI18n';
import { formatVndForLocale } from '../../../shared/i18n/format';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';

export default function RecentlyViewedSection() {
  const { t, locale } = useI18n();
  const { hotels, clearAll } = useRecentlyViewed();

  if (hotels.length === 0) return null;

  return (
    <section className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-px w-16 bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {t('recentlyViewed.title')}
              </span>
            </div>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-xs font-medium text-text-secondary transition-all duration-200 hover:border-destructive/30 hover:text-destructive"
          >
            <X className="size-3" />
            {t('recentlyViewed.clearAll')}
          </button>
        </div>

        {/* Horizontal scroll */}
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide md:-mx-8 md:px-8">
          <div className="flex gap-5" style={{ width: 'max-content' }}>
            {hotels.map((hotel) => (
              <Link
                key={hotel.id}
                to={`/hotel/${hotel.slug}`}
                className="group block w-[220px] shrink-0"
              >
                {/* Card */}
                <div className="relative overflow-hidden rounded-2xl bg-surface ring-1 ring-black/5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_12px_32px_rgba(16,32,29,.1)] hover:-translate-y-1">
                  {/* Thumbnail */}
                  <div className="relative h-32 overflow-hidden">
                    {hotel.thumbnail ? (
                      <img
                        src={hotel.thumbnail}
                        alt={hotel.name}
                        className="h-full w-full object-cover transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-primary/10">
                        <MapPin className="size-6 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-sm font-bold text-navy">{hotel.name}</h3>
                    {hotel.minPrice > 0 && (
                      <div className="mt-2 flex items-end justify-between">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">{t('common.from')}</div>
                          <span className="text-sm font-bold text-primary">{formatVndForLocale(hotel.minPrice, locale)}</span>
                        </div>
                        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                          <ArrowRight className="size-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
