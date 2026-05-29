import type { Hotel } from '../../../shared/api/hotels';
import { useI18n } from '../../../shared/i18n';
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text tracking-tight">{hotel.name}</h1>
        <div className="flex items-center gap-2 mt-1" aria-label={t('hotel.location')}>
          <span className="text-sm">{'⭐'.repeat(hotel.star_rating)}</span>
          <span className="text-sm text-text-secondary">·</span>
          <span className="text-sm text-text-secondary">📍 {hotel.address}</span>
          <span className="text-sm text-text-secondary">·</span>
          <span className="text-sm text-text-secondary">{hotel.location?.name}</span>
        </div>
      </div>

      {hotel.description && (
        <section aria-label={t('hotel.overview')}>
          <p className="text-sm text-text-secondary leading-relaxed">{hotel.description}</p>
        </section>
      )}

      {/* Check-in/out times */}
      <div className="flex gap-6">
        <div>
          <div className="text-xs text-text-secondary uppercase font-semibold">{t('hotel.checkIn')}</div>
          <div className="text-sm font-medium text-text">{hotel.checkin_time || '14:00'}</div>
        </div>
        <div>
          <div className="text-xs text-text-secondary uppercase font-semibold">{t('hotel.checkOut')}</div>
          <div className="text-sm font-medium text-text">{hotel.checkout_time || '12:00'}</div>
        </div>
      </div>

      {/* Amenities */}
      {hotel.amenities && hotel.amenities.length > 0 && (
        <div>
          <h3 className="font-bold text-text text-sm mb-2">{t('hotel.amenities')}</h3>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.map((amenity) => (
              <span key={amenity} className="bg-tab text-text-secondary px-3 py-1.5 rounded-full text-xs font-medium">
                {amenityLabel(amenity, amenityLabels)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="flex gap-4 text-xs text-text-secondary">
        {hotel.phone && <span>📞 {hotel.phone}</span>}
        {hotel.email && <span>✉️ {hotel.email}</span>}
      </div>
    </div>
  );
}
