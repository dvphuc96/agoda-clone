import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '../../../shared/i18n/useI18n';
import DateField, { nextDateString, todayDateString } from '../common/DateField';

interface BookingFormProps {
  maxGuests: number;
  onSubmit: (data: { check_in: string; check_out: string; guests: number; special_requests: string }) => void;
  loading: boolean;
}

export default function BookingForm({ maxGuests, onSubmit, loading }: BookingFormProps) {
  const { locale, t } = useI18n();
  const [searchParams] = useSearchParams();
  const [checkIn, setCheckIn] = useState(searchParams.get('check_in') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('check_out') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 1);
  const [specialRequests, setSpecialRequests] = useState('');
  const today = todayDateString();
  const minCheckOut = checkIn ? nextDateString(checkIn) : today;

  const handleCheckInChange = (value: string) => {
    setCheckIn(value);
    if (checkOut && checkOut <= value) {
      setCheckOut(nextDateString(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ check_in: checkIn, check_out: checkOut, guests, special_requests: specialRequests });
  };

  // Calculate nights
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-text">{t('booking.guestInfo')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateField id="booking-check-in" label={t('searchForm.checkIn')} value={checkIn} min={today} locale={locale} required onChange={handleCheckInChange} />
        <DateField id="booking-check-out" label={t('searchForm.checkOut')} value={checkOut} min={minCheckOut} locale={locale} required onChange={setCheckOut} />
      </div>

      <div>
        <label htmlFor="booking-guests" className="block text-sm font-medium text-text mb-1.5">{t('searchForm.guests')}</label>
        <select
          id="booking-guests"
          value={guests}
          onChange={e => setGuests(Number(e.target.value))}
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
        >
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>
              {n === 1 ? t('searchForm.guestsSingular') : t('searchForm.guestsPlural', { count: n })}
            </option>
          ))}
        </select>
      </div>

      {nights > 0 && (
        <div className="bg-primary/5 text-primary text-sm rounded-lg px-4 py-2.5">
          <span className="font-semibold">{t('booking.nights', { count: nights })}</span>
        </div>
      )}

      <div>
        <label htmlFor="booking-special-requests" className="block text-sm font-medium text-text mb-1.5">{t('booking.specialRequests')}</label>
        <textarea
          id="booking-special-requests"
          value={specialRequests}
          onChange={e => setSpecialRequests(e.target.value)}
          rows={3}
          placeholder={t('booking.specialRequestsPlaceholder')}
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !checkIn || !checkOut}
        className="w-full min-w-0 bg-gold text-white py-3 px-4 rounded-lg font-semibold text-sm break-words hover:bg-amber-600 transition-colors disabled:opacity-50"
      >
        {loading ? t('booking.submitting') : t('booking.confirm')}
      </button>
    </form>
  );
}
