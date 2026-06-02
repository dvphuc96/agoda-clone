import { useReducer, type FormEvent } from 'react';
import { Briefcase, CarFront, Clock, Plane, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { TransferDirection, TransferQuote } from '../../../shared/api/transfers';
import { formatVndForLocale } from '../../../shared/i18n/format';
import { useI18n } from '../../../shared/i18n/useI18n';
import DateField, { nextDateString, todayDateString } from '../common/DateField';
import { findSelectedTransferQuote } from './bookingTransferSelection';

interface BookingFormProps {
  maxGuests: number;
  defaultContactName?: string;
  defaultContactPhone?: string | null;
  transferQuotes: TransferQuote[];
  transferQuotesLoading: boolean;
  transferQuotesFetching: boolean;
  onSummaryChange?: (summary: BookingFormSummaryState) => void;
  onSubmit: (data: {
    check_in: string;
    check_out: string;
    guests: number;
    special_requests: string;
    transfer_add_on?: {
      transfer_route_id: number;
      pickup_datetime: string;
      contact_name: string;
      contact_phone: string;
      flight_number?: string;
      special_requests?: string;
    };
  }) => void;
  loading: boolean;
}

export interface BookingFormSummaryState {
  checkIn: string;
  checkOut: string;
  guests: number;
  transferEnabled: boolean;
  transferDirection: TransferDirection;
  selectedTransferVehicleTypeId: string;
}

type FormState = {
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
  transferEnabled: boolean;
  transferDirection: TransferDirection;
  selectedTransferVehicleTypeId: string;
  pickupTime: string;
  contactName: string;
  contactPhone: string;
  flightNumber: string;
  transferNotes: string;
};

type FormAction =
  | { type: 'set'; field: keyof FormState; value: string | number | boolean }
  | { type: 'setTransferSearch'; field: 'guests' | 'transferDirection'; value: number | TransferDirection }
  | { type: 'toggleTransfer'; value: boolean }
  | { type: 'checkIn'; value: string };

function formReducer(state: FormState, action: FormAction): FormState {
  if (action.type === 'checkIn') {
    const nextCheckOut = state.checkOut && state.checkOut <= action.value ? nextDateString(action.value) : state.checkOut;
    return { ...state, checkIn: action.value, checkOut: nextCheckOut };
  }

  if (action.type === 'setTransferSearch') {
    return { ...state, [action.field]: action.value };
  }

  if (action.type === 'toggleTransfer') {
    return {
      ...state,
      transferEnabled: action.value,
    };
  }

  return { ...state, [action.field]: action.value };
}

export default function BookingForm({
  maxGuests,
  defaultContactName = '',
  defaultContactPhone = '',
  transferQuotes,
  transferQuotesLoading,
  transferQuotesFetching,
  onSummaryChange,
  onSubmit,
  loading,
}: BookingFormProps) {
  const { locale, t } = useI18n();
  const [searchParams] = useSearchParams();
  const [state, dispatch] = useReducer(formReducer, {
    checkIn: searchParams.get('check_in') || '',
    checkOut: searchParams.get('check_out') || '',
    guests: Number(searchParams.get('guests')) || 1,
    specialRequests: '',
    transferEnabled: false,
    transferDirection: 'airport_to_hotel',
    selectedTransferVehicleTypeId: '',
    pickupTime: '09:00',
    contactName: defaultContactName,
    contactPhone: defaultContactPhone ?? '',
    flightNumber: '',
    transferNotes: '',
  });
  const today = todayDateString();
  const minCheckOut = state.checkIn ? nextDateString(state.checkIn) : today;

  const selectedQuote = findSelectedTransferQuote(transferQuotes, state.selectedTransferVehicleTypeId);
  const pickupDate = state.transferDirection === 'airport_to_hotel' ? state.checkIn : state.checkOut;

  const syncSummary = (nextState: FormState) => {
    onSummaryChange?.({
      checkIn: nextState.checkIn,
      checkOut: nextState.checkOut,
      guests: nextState.guests,
      transferEnabled: nextState.transferEnabled,
      transferDirection: nextState.transferDirection,
      selectedTransferVehicleTypeId: nextState.selectedTransferVehicleTypeId,
    });
  };

  const updateSummaryField = (action: FormAction) => {
    const nextState = formReducer(state, action);
    dispatch(action);
    syncSummary(nextState);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const transfer_add_on = state.transferEnabled && selectedQuote && pickupDate
      ? {
          transfer_route_id: selectedQuote.route_id,
          pickup_datetime: `${pickupDate} ${state.pickupTime}:00`,
          contact_name: state.contactName,
          contact_phone: state.contactPhone,
          flight_number: state.flightNumber || undefined,
          special_requests: state.transferNotes || undefined,
        }
      : undefined;

    onSubmit({
      check_in: state.checkIn,
      check_out: state.checkOut,
      guests: state.guests,
      special_requests: state.specialRequests,
      transfer_add_on,
    });
  };

  // Calculate nights
  const nights = state.checkIn && state.checkOut
    ? Math.max(1, Math.ceil((new Date(state.checkOut).getTime() - new Date(state.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-text">{t('booking.guestInfo')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateField id="booking-check-in" label={t('searchForm.checkIn')} value={state.checkIn} min={today} locale={locale} required onChange={(value) => updateSummaryField({ type: 'checkIn', value })} />
        <DateField id="booking-check-out" label={t('searchForm.checkOut')} value={state.checkOut} min={minCheckOut} locale={locale} required onChange={(value) => updateSummaryField({ type: 'set', field: 'checkOut', value })} />
      </div>

      <div>
        <label htmlFor="booking-guests" className="block text-sm font-medium text-text mb-1.5">{t('searchForm.guests')}</label>
        <select
          id="booking-guests"
          value={state.guests}
          onChange={e => updateSummaryField({ type: 'setTransferSearch', field: 'guests', value: Number(e.target.value) })}
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
          value={state.specialRequests}
          onChange={e => dispatch({ type: 'set', field: 'specialRequests', value: e.target.value })}
          rows={3}
          placeholder={t('booking.specialRequestsPlaceholder')}
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
        />
      </div>

      <div className="rounded-2xl border border-border bg-primary/5 p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={state.transferEnabled}
            onChange={(event) => updateSummaryField({ type: 'toggleTransfer', value: event.target.checked })}
            className="mt-1"
          />
          <span>
            <span className="flex items-center gap-2 font-bold text-text"><CarFront className="size-4 text-primary" /> {t('transfers.nav')}</span>
            <span className="mt-1 block text-sm text-text-secondary">{t('transfers.subtitle')}</span>
          </span>
        </label>

        {state.transferEnabled && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-text">{t('transfers.route')}</span>
                <select
                  value={state.transferDirection}
                  onChange={(event) => updateSummaryField({ type: 'setTransferSearch', field: 'transferDirection', value: event.target.value as TransferDirection })}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  <option value="airport_to_hotel">{t('transfers.airportToHotel')}</option>
                  <option value="hotel_to_airport">{t('transfers.hotelToAirport')}</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-text">{t('transfers.pickupTime')}</span>
                <input
                  type="time"
                  value={state.pickupTime}
                  onChange={(event) => dispatch({ type: 'set', field: 'pickupTime', value: event.target.value })}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </label>
            </div>

            {transferQuotesLoading ? (
              <div className="skeleton h-24 rounded-xl" />
            ) : transferQuotes.length > 0 ? (
              <div className="grid gap-3">
                {transferQuotes.map((quote) => (
                  <label key={quote.route_id} className={`block cursor-pointer rounded-xl border bg-white p-3 transition ${state.selectedTransferVehicleTypeId === String(quote.vehicle_type.id) ? 'border-primary ring-2 ring-primary/15' : 'border-border'}`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="transfer-route"
                        value={quote.vehicle_type.id}
                        checked={state.selectedTransferVehicleTypeId === String(quote.vehicle_type.id)}
                        onChange={(event) => updateSummaryField({ type: 'set', field: 'selectedTransferVehicleTypeId', value: event.target.value })}
                        className="mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-bold text-text">{quote.vehicle_type.name}</span>
                          <span className="font-bold text-primary">{formatVndForLocale(quote.price, locale)}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-text-secondary">
                          <span className="inline-flex items-center gap-1 rounded-full bg-tab px-2.5 py-1"><Plane className="size-3" /> {quote.airport_code}</span>
                          {quote.distance_km && <span className="inline-flex items-center gap-1 rounded-full bg-tab px-2.5 py-1">{t('transfers.distance', { count: quote.distance_km })}</span>}
                          <span className="inline-flex items-center gap-1 rounded-full bg-tab px-2.5 py-1"><Users className="size-3" /> {t('transfers.vehicleCapacity', { count: quote.vehicle_type.passenger_capacity })}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-tab px-2.5 py-1"><Briefcase className="size-3" /> {t('transfers.luggageCapacity', { count: quote.vehicle_type.luggage_capacity })}</span>
                          {quote.duration_minutes && <span className="inline-flex items-center gap-1 rounded-full bg-tab px-2.5 py-1"><Clock className="size-3" /> {t('transfers.duration', { count: quote.duration_minutes })}</span>}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-white px-4 py-5 text-sm text-text-secondary">
                {t('transfers.noQuotesBody')}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-text">{t('transfers.contactName')}</span>
                <input value={state.contactName} onChange={(event) => dispatch({ type: 'set', field: 'contactName', value: event.target.value })} className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-text">{t('transfers.contactPhone')}</span>
                <input value={state.contactPhone} onChange={(event) => dispatch({ type: 'set', field: 'contactPhone', value: event.target.value })} className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-text">{t('transfers.flightNumber')}</span>
                <input value={state.flightNumber} onChange={(event) => dispatch({ type: 'set', field: 'flightNumber', value: event.target.value })} placeholder="VN123" className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-text">{t('transfers.notes')}</span>
                <input value={state.transferNotes} onChange={(event) => dispatch({ type: 'set', field: 'transferNotes', value: event.target.value })} placeholder={t('transfers.notesPlaceholder')} className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </label>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !state.checkIn || !state.checkOut || (state.transferEnabled && (!selectedQuote || transferQuotesFetching || !state.contactName || !state.contactPhone))}
        className="w-full min-w-0 bg-gold text-white py-3 px-4 rounded-lg font-semibold text-sm break-words hover:bg-amber-600 transition-colors disabled:opacity-50"
      >
        {loading ? t('booking.submitting') : t('booking.confirm')}
      </button>
    </form>
  );
}
