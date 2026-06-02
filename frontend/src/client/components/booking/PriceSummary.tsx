import type { RoomType } from '../../../shared/api/hotels';
import type { TransferQuote } from '../../../shared/api/transfers';
import { formatDateForLocale, formatVndForLocale } from '../../../shared/i18n/format';
import { useI18n } from '../../../shared/i18n/useI18n';
import { getBookingSummaryTotals } from './bookingSummaryTotals';

interface PriceSummaryProps {
  room: RoomType;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  transferQuote?: TransferQuote | null;
}

export default function PriceSummary({ room, hotelName, checkIn, checkOut, nights, guests, transferQuote }: PriceSummaryProps) {
  const { locale, t } = useI18n();
  const formatPrice = (price: string | number) => formatVndForLocale(price, locale);
  const formatZeroPrice = () => formatVndForLocale(0, locale);

  const totals = getBookingSummaryTotals({
    roomPricePerNight: room.price_per_night,
    nights,
    transferQuote,
  });
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
          <span className="text-text">{formatPrice(totals.roomTotal)}</span>
        </div>
        {transferQuote && (
          <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
            <span className="text-text-secondary">
              {t('transfers.nav')} - {transferQuote.vehicle_type.name} ({transferQuote.airport_code})
            </span>
            <span className="text-text">{formatPrice(totals.transferTotal)}</span>
          </div>
        )}
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
          <span className="text-text-secondary">{t('booking.taxes')}</span>
          <span className="text-text">{formatZeroPrice()}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
        <span className="font-bold text-text">{t('booking.total')}</span>
        <span className="text-xl font-bold text-primary">{formatPrice(totals.grandTotal)}</span>
      </div>
    </div>
  );
}
