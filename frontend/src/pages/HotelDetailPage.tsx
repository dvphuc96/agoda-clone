import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { hotelsApi } from '../api/hotels';
import ImageGallery from '../components/hotel/ImageGallery';
import HotelInfo from '../components/hotel/HotelInfo';
import RoomTypeCard from '../components/hotel/RoomTypeCard';

export default function HotelDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';

  const { data: hotel, isLoading, isError } = useQuery({
    queryKey: ['hotel', slug],
    queryFn: () => hotelsApi.getHotel(slug!).then(r => r.data),
    enabled: !!slug,
  });

  // Also fetch room availability if dates are provided
  const { data: rooms } = useQuery({
    queryKey: ['hotel-rooms', slug, checkIn, checkOut],
    queryFn: () => hotelsApi.getRooms(slug!, checkIn, checkOut).then(r => r.data),
    enabled: !!slug && !!checkIn && !!checkOut,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-tab rounded w-1/3" />
          <div className="h-64 bg-tab rounded-2xl" />
          <div className="h-48 bg-tab rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !hotel) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-text">Khong tim thay khach san</h2>
        <p className="text-sm text-text-secondary mt-2">Vui long thu lai voi mot khach san khac.</p>
        <Link to="/search" className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
          Quay lai tim kiem
        </Link>
      </div>
    );
  }

  // Use rooms with availability if available, otherwise fall back to hotel.room_types
  const displayRooms = rooms && rooms.length > 0 ? rooms : hotel.room_types ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link to="/" className="hover:text-primary transition-colors">Trang chu</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-primary transition-colors">Tim kiem</Link>
        <span>/</span>
        <span className="text-text">{hotel.name}</span>
      </div>

      {/* Gallery */}
      <ImageGallery images={hotel.images ?? []} hotelName={hotel.name} />

      {/* Hotel Info */}
      <HotelInfo hotel={hotel} />

      {/* Room Types */}
      <div>
        <h2 className="text-xl font-bold text-text tracking-tight mb-4">Cac loai phong</h2>
        {displayRooms.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <p>Chua co thong tin phong.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayRooms.map((room, idx) => (
              <RoomTypeCard key={room.id} room={room} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
