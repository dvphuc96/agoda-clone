import { Star, MapPin, Phone, Mail, Clock, Shield, Zap } from 'lucide-react';
import type { Hotel } from '../../../shared/api/hotels';
import { useI18n } from '../../../shared/i18n/useI18n';
import { amenityLabel } from '../../../shared/ui/travel';

export default function HotelInfo({ hotel }: { hotel: Hotel }) {
  const { t } = useI18n();
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

  return (
    <div>
      {/* Hotel name + stars + location */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {hotel.star_rating > 0 && (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: hotel.star_rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-gold-light text-gold-light" />
                ))}
              </span>
            )}
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
              {hotel.property_type}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text md:text-3xl">{hotel.name}</h1>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span>{hotel.address}, {hotel.location?.name}</span>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
          <Shield className="size-3.5" />
          {t('hotel.trustFreeCancel')}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <Zap className="size-3.5" />
          {t('hotel.trustInstantConfirm')}
        </span>
      </div>

      {/* Description */}
      {hotel.description && (
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-text-secondary">{hotel.description}</p>
      )}

      {/* Check-in/out + Contact row */}
      <div className="mt-6 flex flex-wrap gap-6 rounded-xl bg-warm-surface px-5 py-4">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{t('hotel.checkIn')}</div>
            <div className="text-sm font-bold text-text">{hotel.checkin_time || '14:00'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{t('hotel.checkOut')}</div>
            <div className="text-sm font-bold text-text">{hotel.checkout_time || '12:00'}</div>
          </div>
        </div>
        {hotel.phone && (
          <div className="flex items-center gap-2">
            <Phone className="size-4 text-primary" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{t('hotel.checkIn')}</div>
              <div className="text-sm font-bold text-text">{hotel.phone}</div>
            </div>
          </div>
        )}
        {hotel.email && (
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Email</div>
              <div className="text-sm font-bold text-text">{hotel.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* Amenities */}
      {hotel.amenities && hotel.amenities.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-text">{t('hotel.amenities')}</h3>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.map((amenity) => (
              <span key={amenity} className="inline-flex items-center rounded-lg bg-surface px-3 py-2 text-xs font-medium text-text-secondary ring-1 ring-black/5">
                {amenityLabel(amenity, amenityLabels)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
