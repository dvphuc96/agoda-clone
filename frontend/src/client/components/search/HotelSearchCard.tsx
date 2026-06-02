import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BedDouble, MapPin, Star, UsersRound } from 'lucide-react';
import type { Hotel } from '../../../shared/api/hotels';
import { formatVndForLocale } from '../../../shared/i18n/format';
import { useI18n } from '../../../shared/i18n/useI18n';
import { amenityLabel, hotelBackdrop, hotelImage } from '../../../shared/ui/travel';
import WishlistButton from '../hotel/WishlistButton';

export default function HotelSearchCard({ hotel, index }: { hotel: Hotel; index: number }) {
  const { locale, t } = useI18n();
  const checkIn = new URLSearchParams(window.location.search).get('check_in') || '';
  const checkOut = new URLSearchParams(window.location.search).get('check_out') || '';
  const room = hotel.room_types?.[0];
  const minPrice = hotel.min_price ?? room?.price_per_night;
  const maxPrice = hotel.max_price ?? minPrice;
  const numericMinPrice = Number(minPrice);
  const numericMaxPrice = Number(maxPrice);
  const hasPrice = Number.isFinite(numericMinPrice) && numericMinPrice > 0;
  const hasPriceRange = hasPrice && Number.isFinite(numericMaxPrice) && numericMaxPrice > numericMinPrice;
  const displayPrice = hasPriceRange
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
    air_conditioning: t('amenities.air_conditioning'),
    breakfast: t('amenities.breakfast'),
  };

  const viewRoomLink = checkIn && checkOut
    ? `/hotel/${hotel.slug}?check_in=${checkIn}&check_out=${checkOut}`
    : `/hotel/${hotel.slug}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-shadow/5 ring-1 ring-black/5 transition-spring hover:-translate-y-1.5 hover:shadow-2xl md:flex-row">
      <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-t-[calc(1rem-6px)] md:h-auto md:w-64 md:rounded-l-[calc(1rem-6px)] md:rounded-tr-none bg-cover bg-center" style={hotelBackdrop(index)}>
        <img
          src={hotelImage(hotel, index)}
          alt={hotel.name}
          onError={event => {
            event.currentTarget.style.display = 'none';
          }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.16),transparent_34%,rgba(0,0,0,.22))]" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-navy shadow-sm backdrop-blur">
          {hotel.location?.name}
        </div>
        <div className="absolute right-3 top-3">
          <WishlistButton hotelId={hotel.id} initialWishlisted={hotel.is_wishlisted} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between rounded-tr-[calc(1rem-6px)] bg-surface p-4 md:p-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-warm-gold-surface px-2.5 py-1 text-xs font-bold text-gold-dark">
              <Star className="size-3.5 fill-current" />
              {hotel.star_rating}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <BadgeCheck className="size-3.5" />
              {t('search.recommended')}
            </span>
          </div>
          <Link to={viewRoomLink} className="text-lg font-semibold leading-6 text-text transition-spring-fast hover:text-primary">
            {hotel.name}
          </Link>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary">
            <MapPin className="size-4 text-primary" />
            <span>{hotel.address}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hotel.amenities?.slice(0, 5).map((amenity) => (
              <span key={amenity} className="rounded-full bg-tab px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                {amenityLabel(amenity, amenityLabels)}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-text-secondary">
            {room?.bed_type && <span className="inline-flex items-center gap-1.5"><BedDouble className="size-3.5 text-primary" />{room.bed_type}</span>}
            {room?.max_guests && <span className="inline-flex items-center gap-1.5"><UsersRound className="size-3.5 text-primary" />{t('hotel.maxGuests', { count: room.max_guests })}</span>}
            {room?.available_rooms !== undefined && (
              room.available_rooms <= 3 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive animate-pulse">
                  {t('hotel.onlyRoomsLeft', { count: room.available_rooms })}
                </span>
              ) : (
                <span className="font-semibold text-success">{t('hotel.availableRooms', { count: room.available_rooms })}</span>
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-br-[calc(1rem-6px)] border-t border-border bg-surface p-4 md:w-56 md:flex-col md:items-end md:border-l md:border-t-0 md:p-5">
        <div className="text-left md:text-right">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">{t('common.from')}</div>
          <div className="text-2xl font-semibold text-navy">{displayPrice}</div>
          {hasPrice && (
            <div className="text-xs text-text-secondary">
              {t('common.perNight')} · {t('search.taxNote')}
            </div>
          )}
        </div>
        <Link
          to={viewRoomLink}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition-spring-fast active:scale-[0.97] hover:bg-primary-hover"
        >
          {t('hotel.chooseRoom')}
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/20"><ArrowRight className="size-3" /></span>
        </Link>
      </div>
    </div>
  );
}
