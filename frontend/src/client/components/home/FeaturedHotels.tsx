import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Shield, Zap } from 'lucide-react';
import { getCollectionData, hotelsApi, type Hotel } from '../../../shared/api/hotels';
import { formatVndForLocale } from '../../../shared/i18n/format';
import { useI18n } from '../../../shared/i18n/useI18n';

export default function FeaturedHotels() {
  const { t } = useI18n();
  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['featured-hotels'],
    queryFn: () => hotelsApi.getFeatured().then(r => getCollectionData<Hotel>(r.data)),
  });

  const displayHotels = hotels?.slice(0, 6) ?? [];
  const featured = displayHotels[0];
  const sideCards = displayHotels.slice(1, 3);
  const bottomCards = displayHotels.slice(3, 6);

  return (
    <section id="featured" className="px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-16 md:mb-20">
          <div className="flex items-center gap-3">
            <div className="h-px w-16 bg-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t('home.featuredTitle')}</span>
          </div>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-md text-4xl font-bold tracking-tight text-navy md:text-5xl">
              {t('home.featuredSubtitle')}
            </h2>
            <Link to="/search" className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-primary/40 hover:bg-primary/10 hover:shadow-[0_4px_16px_rgba(15,118,110,0.15)]">
              {t('home.exploreHotels')}
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-110">
                <ArrowRight className="size-3" />
              </span>
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:auto-rows-[320px]">
            <div className="skeleton rounded-[2rem] lg:col-span-2 lg:row-span-2" />
            <div className="skeleton rounded-[2rem]" />
            <div className="skeleton rounded-[2rem]" />
          </div>
        )}

        {/* Asymmetric layout: featured + side */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:auto-rows-[320px]">
          {featured && (
            <div className="reveal lg:col-span-2 lg:row-span-2">
              <FeaturedHeroCard hotel={featured} />
            </div>
          )}
          {sideCards.map((hotel, idx) => (
            <div key={hotel.id} className="reveal" data-delay={(idx + 1) * 100}>
              <FeaturedSideCard hotel={hotel} />
            </div>
          ))}
        </div>

        {/* Bottom row */}
        {bottomCards.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {bottomCards.map((hotel, idx) => (
              <div key={hotel.id} className="reveal" data-delay={(idx + 3) * 100}>
                <FeaturedSmallCard hotel={hotel} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedHeroCard({ hotel }: { hotel: Hotel }) {
  const { locale, t } = useI18n();
  const minPrice = hotel.min_price ?? hotel.room_types?.[0]?.price_per_night;
  const numeric = Number(minPrice);
  const hasPrice = Number.isFinite(numeric) && numeric > 0;

  return (
    <Link
      to={`/hotel/${hotel.slug}`}
      className="group relative flex h-full min-h-[360px] flex-col justify-end overflow-hidden rounded-[2rem]"
    >
      <div className="absolute inset-0">
        <img
          src={hotel.images?.[0]?.image_path || `https://picsum.photos/seed/${hotel.slug}/1200/800`}
          alt={hotel.name}
          className="h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/40 to-transparent" />
      </div>

      {/* Trust badges */}
      <div className="absolute left-6 top-6 flex gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
          <Shield className="size-3" />
          {t('hotel.trustFreeCancel')}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
          <Zap className="size-3" />
          {t('hotel.trustInstantConfirm')}
        </span>
      </div>

      {/* Star rating */}
      {hotel.star_rating && (
        <div className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-black/20 px-3 py-1.5 backdrop-blur-sm">
          {Array.from({ length: hotel.star_rating }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-gold-light text-gold-light" />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative p-8 md:p-10">
        <h3 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">{hotel.name}</h3>
        <div className="mt-2 flex items-center gap-2 text-white/80">
          <MapPin className="size-4" />
          <span className="text-base md:text-lg">{hotel.location?.name}</span>
        </div>
        {hasPrice && (
          <div className="mt-5">
            <span className="text-sm text-white/60">{t('common.from')} </span>
            <span className="text-3xl font-bold text-gold-light md:text-4xl">{formatVndForLocale(minPrice, locale)}</span>
            <span className="text-sm text-white/60"> {t('common.perNight')}</span>
          </div>
        )}
        <div className="mt-6">
          <span className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-navy transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(15,118,110,0.3)]">
            {t('common.viewDetails')}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy/10 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white/20 group-hover:translate-x-0.5">
              <ArrowRight className="size-3.5" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedSideCard({ hotel }: { hotel: Hotel }) {
  const { locale } = useI18n();
  const minPrice = hotel.min_price ?? hotel.room_types?.[0]?.price_per_night;
  const numeric = Number(minPrice);
  const hasPrice = Number.isFinite(numeric) && numeric > 0;

  return (
    <Link
      to={`/hotel/${hotel.slug}`}
      className="group relative flex h-full overflow-hidden rounded-[2rem] bg-surface"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={hotel.images?.[0]?.image_path || `https://picsum.photos/seed/${hotel.slug}/400/300`}
          alt={hotel.name}
          className="h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
        {hotel.star_rating && (
          <div className="absolute right-4 top-4 flex items-center gap-0.5 rounded-full bg-black/20 px-2 py-1 backdrop-blur-sm">
            {Array.from({ length: hotel.star_rating }).map((_, i) => (
              <Star key={i} className="size-3 fill-gold-light text-gold-light" />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-5">
        <div className="flex-1">
          <h3 className="line-clamp-1 text-lg font-bold text-navy">{hotel.name}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
            <MapPin className="size-3.5" />
            {hotel.location?.name}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/50 pt-4">
          {hasPrice && <span className="text-base font-bold text-primary">{formatVndForLocale(minPrice, locale)}</span>}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-primary group-hover:text-white group-hover:scale-110">
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedSmallCard({ hotel }: { hotel: Hotel }) {
  const { locale, t } = useI18n();
  const minPrice = hotel.min_price ?? hotel.room_types?.[0]?.price_per_night;
  const numeric = Number(minPrice);
  const hasPrice = Number.isFinite(numeric) && numeric > 0;

  return (
    <Link
      to={`/hotel/${hotel.slug}`}
      className="group block"
    >
      {/* Double-Bezel */}
      <div className="relative bg-shadow/5 rounded-[1.75rem] ring-1 ring-black/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_16px_48px_rgba(16,32,29,.1)] hover:-translate-y-1">
        <div className="overflow-hidden rounded-[calc(1.75rem-6px)] bg-white">
          <div className="relative h-48 overflow-hidden">
            <img
              src={hotel.images?.[0]?.image_path || `https://picsum.photos/seed/${hotel.slug}/400/300`}
              alt={hotel.name}
              className="h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {hotel.star_rating && (
              <div className="absolute left-4 top-4 flex items-center gap-0.5 rounded-full bg-black/20 px-2 py-1 backdrop-blur-sm">
                {Array.from({ length: hotel.star_rating }).map((_, i) => (
                  <Star key={i} className="size-2.5 fill-gold-light text-gold-light" />
                ))}
              </div>
            )}
          </div>
          <div className="p-5">
            <h3 className="line-clamp-1 text-base font-bold text-navy">{hotel.name}</h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
              <MapPin className="size-3" />
              {hotel.location?.name}
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-border/50 pt-4">
              {hasPrice && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary">{t('common.from')}</div>
                  <span className="text-lg font-bold text-primary">{formatVndForLocale(minPrice, locale)}</span>
                </div>
              )}
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-primary-hover group-hover:scale-110 group-hover:shadow-[0_4px_16px_rgba(15,118,110,0.3)]">
                <ArrowRight className="size-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}