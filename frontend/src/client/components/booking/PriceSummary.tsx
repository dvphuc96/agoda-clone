import type { RoomType } from '../../../shared/api/hotels';
import { formatDateForLocale, formatVndForLocale } from '../../../shared/i18n/format';
import { useI18n } from '../../../shared/i18n';

interface PriceSummaryProps {
  room: RoomType;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
}

export default function PriceSummary({ room, hotelName, checkIn, checkOut, nights, guests }: PriceSummaryProps) {
  const { locale, t } = useI18n();
  const formatPrice = (price: string | number) => formatVndForLocale(price, locale);
  const formatZeroPrice = () =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(0);

  const pricePerNight = Number(room.price_per_night);
  const totalPrice = pricePerNight * nights;
  const guestLabel = guests === 1
    ? t('searchForm.guestsSingular')
    : t('searchForm.guestsPlural', { count: guests });

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border/50 p-6 sticky top-4">
      <h3 className="font-bold text-text mb-4">{t('booking.priceSummary')}</h3>

      {/* Room & Hotel Info */}
      <div className="space-y-2 mb-4 pb-4 border-b border-border/50">
        <div className="font-medium text-text">{room.name}</div>
        <div className="text-sm text-text-secondary">{hotelName}</div>
        {checkIn && checkOut && (
          <div className="text-sm text-text-secondary">
            {formatDateForLocale(checkIn, locale)} → {formatDateForLocale(checkOut, locale)}
          </div>
        )}
        <div className="text-sm text-text-secondary">{guestLabel}</div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 mb-4 pb-4 border-b border-border/50">
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
          <span className="text-text-secondary">{formatPrice(room.price_per_night)} x {t('booking.nights', { count: nights })}</span>
          <span className="text-text">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
          <span className="text-text-secondary">{t('booking.taxes')}</span>
          <span className="text-text">{formatZeroPrice()}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
        <span className="font-bold text-text">{t('booking.total')}</span>
        <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
      </div>
    </div>
  );
}
