import { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../shared/contexts/AuthContext';
import { hotelsApi } from '../../shared/api/hotels';
import { bookingsApi } from '../../shared/api/bookings';
import { transfersApi, type TransferDirection } from '../../shared/api/transfers';
import { type Coupon } from '../../shared/api/coupons';
import { useI18n } from '../../shared/i18n/useI18n';
import { useToast } from '../../shared/hooks/useToast';
import BookingForm from '../components/booking/BookingForm';
import PriceSummary from '../components/booking/PriceSummary';
import CouponInput from '../components/booking/CouponInput';
import { findSelectedTransferQuote } from '../components/booking/bookingTransferSelection';
import { getBookingSummaryTotals } from '../components/booking/bookingSummaryTotals';

type BookingSummaryState = {
  checkIn: string;
  checkOut: string;
  guests: number;
  transferEnabled: boolean;
  transferDirection: TransferDirection;
  selectedTransferVehicleTypeId: string;
};

export default function BookingPage() {
  const { t } = useI18n();
  const { addToast } = useToast();
  const { roomTypeId } = useParams<{ roomTypeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';
  const guestsParam = searchParams.get('guests') || '1';
  const initialGuests = Number(guestsParam) || 1;
  const [summary, setSummary] = useState<BookingSummaryState>({
    checkIn,
    checkOut,
    guests: initialGuests,
    transferEnabled: false,
    transferDirection: 'airport_to_hotel',
    selectedTransferVehicleTypeId: '',
  });

  const { data: roomData, isLoading } = useQuery({
    queryKey: ['room-type', roomTypeId, checkIn, checkOut],
    queryFn: () => hotelsApi.getRoomType(roomTypeId!, { check_in: checkIn, check_out: checkOut }).then((response) => response.data),
    enabled: !!roomTypeId,
  });
  const roomHotelId = roomData?.hotel?.id;
  const transferQuotes = useQuery({
    queryKey: ['booking-transfer-quotes', roomHotelId, summary.transferDirection, summary.guests],
    queryFn: () => transfersApi.hotelQuotes(roomHotelId!, { direction: summary.transferDirection, passengers: summary.guests }).then((response) => response.data.data),
    enabled: isAuthenticated && summary.transferEnabled && Boolean(roomHotelId),
    placeholderData: (previousData) => previousData,
  });

  const selectedTransferQuote = summary.transferEnabled
    ? findSelectedTransferQuote(transferQuotes.data, summary.selectedTransferVehicleTypeId)
    : null;

  const totals = roomData
    ? getBookingSummaryTotals({
        roomPricePerNight: roomData.price_per_night,
        nights: summary.checkIn && summary.checkOut
          ? Math.max(1, Math.ceil((new Date(summary.checkOut).getTime() - new Date(summary.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
          : 1,
        transferQuote: selectedTransferQuote,
        discount: discountAmount,
      })
    : { roomTotal: 0, transferTotal: 0, discountAmount: 0, grandTotal: 0 };

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-text mb-2">{t('auth.requiredTitle')}</h2>
        <p className="text-sm text-text-secondary mb-4">{t('auth.requiredBookingBody')}</p>
        <Link
          to={`/login?redirect=${encodeURIComponent(`/booking/${roomTypeId}${window.location.search}`)}`}
          className="inline-block rounded-full bg-primary px-6 py-2.5 font-semibold text-sm text-white transition-spring-fast hover:bg-primary-hover"
        >
          {t('auth.loginAction')}
        </Link>
      </div>
    );
  }

  const handleBooking = async (data: {
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
  }) => {
    setError('');
    setBookingLoading(true);
    try {
      const booking = await bookingsApi.create({
        room_type_id: Number(roomTypeId),
        check_in: data.check_in,
        check_out: data.check_out,
        guests: data.guests,
        special_requests: data.special_requests || undefined,
        coupon_code: appliedCoupon?.code,
        transfer_add_on: data.transfer_add_on,
      });
      addToast('success', t('booking.success'));
      navigate(`/payment/${booking.data.booking_code}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || t('booking.failure');
      setError(msg);
      addToast('error', msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCouponApplied = (coupon: Coupon, discount: number) => {
    setAppliedCoupon(coupon);
    setDiscountAmount(discount);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  if (isLoading) {
    return (
      <output className="block max-w-5xl mx-auto px-4 md:px-8 py-8" aria-label={t('common.loading')}>
        <span className="sr-only">{t('common.loading')}</span>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-tab rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64 bg-tab rounded-2xl" />
            <div className="h-64 bg-tab rounded-2xl" />
          </div>
        </div>
      </output>
    );
  }

  if (!roomData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-text">{t('booking.defaultRoomName')}</h2>
        <p className="mt-2 text-sm text-text-secondary">{t('common.error')}</p>
        <Link to="/search" className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover">
          {t('hotel.backToSearch')}
        </Link>
      </div>
    );
  }

  const room = roomData;
  const nights = summary.checkIn && summary.checkOut
    ? Math.max(1, Math.ceil((new Date(summary.checkOut).getTime() - new Date(summary.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link to="/" className="transition-spring-fast hover:text-primary">{t('common.home')}</Link>
        <span>/</span>
        <Link to="/search" className="transition-spring-fast hover:text-primary">{t('search.title')}</Link>
        <span>/</span>
        <span className="text-text">{t('booking.title')}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">{t('booking.title')}</h1>
        <p className="text-sm md:text-base text-text-secondary">{t('booking.subtitle')}</p>
      </div>

      {error && (
        <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-6 break-words">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="md:col-span-2">
          <div className="bg-surface rounded-2xl shadow-sm p-6">
            <BookingForm
              maxGuests={room.max_guests}
              defaultContactName={user?.name}
              defaultContactPhone={user?.phone}
              transferQuotes={transferQuotes.data ?? []}
              transferQuotesLoading={transferQuotes.isLoading}
              transferQuotesFetching={transferQuotes.isFetching}
              onSummaryChange={setSummary}
              onSubmit={handleBooking}
              loading={bookingLoading}
            />
          </div>
        </div>

        {/* Price Summary */}
        <div>
          <div className="mb-4">
            <CouponInput
              bookingValue={totals.roomTotal + totals.transferTotal + discountAmount}
              hotelId={roomHotelId}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
            />
          </div>
          <PriceSummary
            room={room}
            hotelName={room.hotel?.name || t('booking.defaultHotelName')}
            checkIn={summary.checkIn}
            checkOut={summary.checkOut}
            nights={nights}
            guests={summary.guests}
            transferQuote={selectedTransferQuote}
            discount={discountAmount}
          />
        </div>
      </div>
    </div>
  );
}
