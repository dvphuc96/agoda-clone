import { Link, useSearchParams } from 'react-router-dom';
import { BedDouble, Users, Maximize, Check } from 'lucide-react';
import type { RoomType } from '../../../shared/api/hotels';
import { formatVndForLocale } from '../../../shared/i18n/format';
import { useI18n } from '../../../shared/i18n/useI18n';
import { amenityLabel } from '../../../shared/ui/travel';

export default function RoomTypeCard({ room, index }: { room: RoomType; index: number }) {
  const { locale, t } = useI18n();
  const [searchParams] = useSearchParams();
  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';
  const guests = searchParams.get('guests') || '';
  const numericPrice = Number(room.price_per_night);
  const hasPrice = Number.isFinite(numericPrice) && numericPrice > 0;
  const displayPrice = formatVndForLocale(room.price_per_night, locale);
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

  const bookingParams = new URLSearchParams();
  if (checkIn) bookingParams.set('check_in', checkIn);
  if (checkOut) bookingParams.set('check_out', checkOut);
  if (guests) bookingParams.set('guests', guests);
  const bookingQuery = bookingParams.toString();
  const bookingLink = `/booking/${room.id}${bookingQuery ? `?${bookingQuery}` : ''}`;

  const isLowAvailability = (room.available_rooms ?? 99) <= 3;
  const isBestDeal = index === 0;

  return (
    <div className={`relative overflow-hidden rounded-2xl transition-spring hover:-translate-y-0.5 hover:shadow-xl ${
      isBestDeal
        ? 'ring-2 ring-primary bg-primary/[0.02]'
        : 'bg-surface ring-1 ring-black/5'
    }`}>
      {/* Best deal badge */}
      {isBestDeal && (
        <div className="absolute left-4 top-0 z-10 rounded-b-lg bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          {t('hotel.highlightDeal')}
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        {/* Room Image */}
        <div className="relative h-48 w-full shrink-0 overflow-hidden md:h-auto md:w-64">
          {room.images?.[0]?.image_path ? (
            <img src={room.images[0].image_path} alt={room.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
              <BedDouble className="size-10 text-primary/30" />
            </div>
          )}
        </div>

        {/* Room Info */}
        <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
          <div>
            <h3 className="text-lg font-bold text-text">{room.name}</h3>

            {/* Room specs */}
            <div className="mt-3 flex flex-wrap gap-3">
              {room.bed_type && (
                <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                  <BedDouble className="size-3.5 text-primary" />
                  {room.bed_type}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <Users className="size-3.5 text-primary" />
                {t('hotel.maxGuests', { count: room.max_guests })}
              </span>
              {room.size_sqm && (
                <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                  <Maximize className="size-3.5 text-primary" />
                  {t('hotel.roomSize', { size: room.size_sqm })}
                </span>
              )}
            </div>

            {/* Description */}
            {room.description && (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-secondary">{room.description}</p>
            )}

            {/* Amenities as check list */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {room.amenities.slice(0, 6).map((amenity) => (
                  <span key={amenity} className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
                    <Check className="size-3 shrink-0 text-success" />
                    {amenityLabel(amenity, amenityLabels)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Urgency */}
          {room.available_rooms !== undefined && (
            room.available_rooms <= 2 ? (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
                {t('hotel.bookQuickly', { count: room.available_rooms })}
              </div>
            ) : room.available_rooms <= 5 ? (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-dark/10 px-3 py-1 text-xs font-semibold text-gold-dark">
                {t('hotel.onlyRoomsLeft', { count: room.available_rooms })}
              </div>
            ) : null
          )}
        </div>

        {/* Price + CTA — Agoda-style right column */}
        <div className="flex flex-row items-center justify-between gap-4 border-t border-border/50 p-5 md:flex-col md:items-end md:justify-center md:border-l md:border-t-0 md:p-6 md:min-w-[200px]">
          {hasPrice ? (
            <div className="text-right">
              <div className="text-[11px] font-medium text-text-secondary">{t('common.from')}</div>
              <div className="text-2xl font-bold text-primary">{displayPrice}</div>
              <div className="text-[11px] text-text-secondary">{t('hotel.perNight')}</div>
              <div className="mt-1 text-[10px] text-success">{t('hotel.includedTaxes')}</div>
            </div>
          ) : (
            <div className="text-right text-xs text-text-secondary">{t('hotel.selectDatesNotice')}</div>
          )}
          <Link
            to={bookingLink}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-spring-fast active:scale-[0.97] ${
              isLowAvailability
                ? 'bg-destructive text-white hover:bg-destructive-hover'
                : 'bg-primary text-white hover:bg-primary-hover'
            }`}
          >
            {t('hotel.chooseRoom')}
          </Link>
        </div>
      </div>
    </div>
  );
}
