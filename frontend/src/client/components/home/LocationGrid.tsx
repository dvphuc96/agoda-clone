import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { getCollectionData, hotelsApi, type Location } from '../../../shared/api/hotels';
import { useI18n } from '../../../shared/i18n';
import { locationBackdrop, locationImage } from '../../../shared/ui/travel';

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

  return (
    <section id="destinations" className="px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text md:text-3xl">{t('home.destinationTitle')}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t('home.destinationSubtitle')}</p>
        </div>
        <Link to="/search" className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-primary hover:text-primary">
          {t('home.viewAllDestinations')} <ArrowRight className="size-4" />
        </Link>
      </div>
      {isLoading && <p className="text-sm text-text-secondary">{t('common.loading')}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {locations?.slice(0, 8)?.map((loc, idx) => (
          <Link key={loc.id} to={`/search?location=${loc.slug}`}
            className={`group overflow-hidden rounded-lg border border-white/70 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${idx === 0 ? 'lg:col-span-2' : ''}`}>
            <div className={`${idx === 0 ? 'h-64' : 'h-52'} relative bg-cover bg-center`} style={locationBackdrop(idx)}>
              <img
                src={locationImage(loc)}
                alt={loc.name}
                onError={event => {
                  event.currentTarget.style.display = 'none';
                }}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.14),transparent_36%,rgba(0,0,0,.18))]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
                  <MapPin className="size-3.5" />
                  {regionLabel(loc.region, t)}
                </div>
                <div className="text-xl font-semibold">{loc.name}</div>
                <div className="mt-1 text-sm text-white/80">{t('home.staysCount', { count: loc.hotels_count ?? 0 })}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  );
}
