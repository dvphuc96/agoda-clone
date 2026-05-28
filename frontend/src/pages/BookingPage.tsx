import { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { hotelsApi, type RoomType, type Hotel } from '../api/hotels';
import { bookingsApi } from '../api/bookings';
import BookingForm from '../components/booking/BookingForm';
import PriceSummary from '../components/booking/PriceSummary';

export default function BookingPage() {
  const { roomTypeId } = useParams<{ roomTypeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';
  const guestsParam = searchParams.get('guests') || '1';

  // We need to get room type info. Since we don't have a direct room type API,
  // we'll compute what we can. In a real app, the API would return room type details.
  // For now, we create a simple structure.
  // We'll use a placeholder room until the backend is ready.
  const { data: roomData, isLoading } = useQuery({
    queryKey: ['room-type', roomTypeId],
    queryFn: async () => {
      // The backend may not have a direct room type endpoint.
      // For now, return a placeholder. The actual data will come from the API.
      return {
        id: Number(roomTypeId),
        name: 'Phong tieu chuan',
        description: null,
        max_guests: 4,
        bed_type: 'double',
        size_sqm: 25,
        price_per_night: '500000',
        amenities: null,
        total_rooms: 10,
        images: [],
        hotel: { name: 'Khach san', slug: 'hotel' } as Hotel,
      } as RoomType & { hotel: Hotel };
    },
    enabled: !!roomTypeId,
  });

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-text mb-2">Ban can dang nhap</h2>
        <p className="text-sm text-text-secondary mb-4">Vui long dang nhap de tiep tuc dat phong.</p>
        <Link
          to={`/login?redirect=/booking/${roomTypeId}`}
          className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Dang nhap
        </Link>
      </div>
    );
  }

  const handleBooking = async (data: { check_in: string; check_out: string; guests: number; special_requests: string }) => {
    setError('');
    setBookingLoading(true);
    try {
      const booking = await bookingsApi.create({
        room_type_id: Number(roomTypeId),
        check_in: data.check_in,
        check_out: data.check_out,
        guests: data.guests,
        special_requests: data.special_requests || undefined,
      });
      navigate(`/payment/${booking.data.booking_code}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Dat phong that bai. Vui long thu lai.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-tab rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64 bg-tab rounded-2xl" />
            <div className="h-64 bg-tab rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const room = roomData!;
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Trang chu</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-primary transition-colors">Tim kiem</Link>
        <span>/</span>
        <span className="text-text">Dat phong</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="md:col-span-2">
          <div className="bg-surface rounded-2xl shadow-sm p-6">
            <BookingForm
              maxGuests={room.max_guests}
              onSubmit={handleBooking}
              loading={bookingLoading}
            />
          </div>
        </div>

        {/* Price Summary */}
        <div>
          <PriceSummary
            room={room}
            hotelName={room.hotel?.name || 'Khach san'}
            checkIn={checkIn}
            checkOut={checkOut}
            nights={nights}
            guests={Number(guestsParam)}
          />
        </div>
      </div>
    </div>
  );
}
