import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { getCollectionData, hotelsApi, type Location } from '../../../shared/api/hotels';
import { useI18n } from '../../../shared/i18n/useI18n';
import { destinationFallbackImage, locationBackdrop, locationImage } from '../../../shared/ui/travel';

function regionLabel(region: string, t: ReturnType<typeof useI18n>['t']) {
  const key = `regions.${region}` as const;
  const label = t(key);
  return label === key ? region.replaceAll('_', ' ') : label;
}

export default function LocationGrid() {
  const { t } = useI18n();
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => hotelsApi.getLocations().then(r => getCollectionData<Location>(r.data)),
  });

  const displayLocations = locations?.slice(0, 8) ?? [];

  return (
    <section id="destinations" className="px-4 py-32 md:px-8 md:py-40 bg-warm-surface/30">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-16 md:mb-20">
          <div className="flex items-center gap-3">
            <div className="h-px w-16 bg-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t('home.destinationTitle')}</span>
          </div>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-md text-4xl font-bold tracking-tight text-navy md:text-5xl">
              {t('home.destinationSubtitle')}
            </h2>
            <Link to="/search" className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-primary/40 hover:bg-primary/10 hover:shadow-[0_4px_16px_rgba(15,118,110,0.15)]">
              {t('home.viewAllDestinations')}
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-110">
                <ArrowRight className="size-3" />
              </span>
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 gap-5 md:gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                <div className="skeleton h-full min-h-56 rounded-[2rem]" />
              </div>
            ))}
          </div>
        )}

        {/* Bento grid layout — asymmetric */}
        <div className="grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-4 lg:auto-rows-[220px]">
          {displayLocations.map((loc, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            return (
              <Link
                key={loc.id}
                to={`/search?location=${loc.slug}`}
                className={`reveal group relative overflow-hidden rounded-[2rem] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(16,32,29,.15)] ${
                  isFirst ? 'col-span-2 row-span-2' : ''
                } ${isSecond ? 'col-span-2 lg:col-span-2' : ''}`}
                data-delay={idx * 80}
              >
                <div className="absolute inset-0 bg-cover bg-center" style={locationBackdrop(idx)}>
                  <img
                    src={locationImage(loc)}
                    alt={loc.name}
                    onError={event => {
                      const fallback = destinationFallbackImage('da-nang');
                      if (event.currentTarget.src !== fallback) {
                        event.currentTarget.src = fallback;
                      }
                    }}
                    className="h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                  />
                </div>
                {/* Elegant gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.08),transparent_50%)]" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/90 backdrop-blur-sm border border-white/10">
                        <MapPin className="size-3" />
                        {regionLabel(loc.region, t)}
                      </div>
                      <div className={`${isFirst ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} font-bold text-white`}>{loc.name}</div>
                      <div className="mt-1 text-sm text-white/70">{t('home.staysCount', { count: loc.hotels_count ?? 0 })}</div>
                    </div>
                    <span className={`flex shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/10 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white group-hover:text-primary group-hover:scale-110 ${isFirst ? 'size-11' : 'size-9'}`}>
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}