import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import type { Hotel } from '../../../shared/api/hotels';
import { formatVndForLocale } from '../../../shared/i18n/format';
import { useI18n } from '../../../shared/i18n/useI18n';
import { amenityLabel, hotelBackdrop, hotelFallbackImage, hotelImage } from '../../../shared/ui/travel';

export default function HotelCard({ hotel, index }: { hotel: Hotel; index: number }) {
  const { locale, t } = useI18n();
  const minPrice = hotel.min_price ?? hotel.room_types?.[0]?.price_per_night;
  const maxPrice = hotel.max_price ?? minPrice;
  const numericMinPrice = Number(minPrice);
  const numericMaxPrice = Number(maxPrice);
  const hasPrice = Number.isFinite(numericMinPrice) && numericMinPrice > 0;
  const hasPriceRange = hasPrice && Number.isFinite(numericMaxPrice) && numericMaxPrice > numericMinPrice;
  const price = hasPriceRange
    ? `${formatVndForLocale(minPrice, locale)} - ${formatVndForLocale(maxPrice, locale)}`
    : formatVndForLocale(minPrice, locale);
  const amenityLabels = {
    wifi: t('amenities.wifi'),
    pool: t('amenities.pool'),
    spa: t('amenities.spa'),
    restaurant: t('amenities.restaurant'),
    gym: t('amenities.gym'),
    parking: t('amenities.parking'),
    beach: t('amenities.beach'),
  };

  return (
    <Link to={`/hotel/${hotel.slug}`}
      className="group overflow-hidden rounded-lg border border-border/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 overflow-hidden bg-cover bg-center" style={hotelBackdrop(index)}>
        <img
          src={hotelImage(hotel, index)}
          alt={hotel.name}
          onError={event => {
            const fallback = hotelFallbackImage(index);
            if (event.currentTarget.src !== fallback) {
              event.currentTarget.src = fallback;
            }
          }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.16),transparent_34%,rgba(0,0,0,.22))]" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="line-clamp-2 text-base font-semibold leading-5 text-text">{hotel.name}</div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
              <MapPin className="size-3.5 text-primary" />
              {hotel.location?.name}
            </div>
          </div>
          <div className="inline-flex items-center gap-1 rounded-md bg-[#fff5df] px-2 py-1 text-xs font-bold text-[#9a5d12]">
            <Star className="size-3.5 fill-current" />
            {hotel.star_rating}
          </div>
        </div>
        <div className="mt-3 flex min-h-7 flex-wrap gap-1.5">
          {hotel.amenities?.slice(0, 3).map((amenity) => (
            <span key={amenity} className="rounded-full bg-tab px-2.5 py-1 text-[11px] font-medium text-text-secondary">
              {amenityLabel(amenity, amenityLabels)}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-border/70 pt-4">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary">{t('common.from')}</div>
            <span className="text-xl font-semibold text-navy">{price}</span>
            {hasPrice && <span className="text-xs text-text-secondary"> {t('common.perNight')}</span>}
          </div>
          <span
            aria-label={t('common.viewDetails')}
            className="inline-flex size-9 items-center justify-center rounded-md bg-primary text-white transition-colors group-hover:bg-[#0b5f59]"
          >
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
