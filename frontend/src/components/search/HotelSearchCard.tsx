import { Link } from 'react-router-dom';
import type { Hotel } from '../../api/hotels';

const gradients = [
  'from-blue-100 to-blue-300',
  'from-sky-100 to-sky-300',
  'from-amber-100 to-amber-300',
  'from-emerald-100 to-emerald-300',
  'from-violet-100 to-violet-300',
];

export default function HotelSearchCard({ hotel, index }: { hotel: Hotel; index: number }) {
  const formatPrice = (price: string | number) =>
    Number(price).toLocaleString('vi-VN') + 'd';

  const checkIn = new URLSearchParams(window.location.search).get('check_in') || '';
  const checkOut = new URLSearchParams(window.location.search).get('check_out') || '';

  const viewRoomLink = checkIn && checkOut
    ? `/hotel/${hotel.slug}?check_in=${checkIn}&check_out=${checkOut}`
    : `/hotel/${hotel.slug}`;

  return (
    <div className="bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row overflow-hidden">
      {/* Image */}
      <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} w-full md:w-56 h-40 md:h-auto shrink-0 flex items-center justify-center`}>
        {hotel.images?.[0]?.image_path ? (
          <img src={hotel.images[0].image_path} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">🏨</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <Link to={viewRoomLink} className="font-bold text-text hover:text-primary transition-colors text-base">
            {hotel.name}
          </Link>
          <div className="text-xs text-text-secondary mt-1 flex items-center gap-1">
            <span>📍 {hotel.destination?.name}</span>
            <span>·</span>
            <span>{'⭐'.repeat(hotel.star_rating)}</span>
          </div>
          <div className="text-xs text-text-secondary mt-2">{hotel.address}</div>
          {/* Amenities pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {hotel.amenities?.slice(0, 5).map((amenity, i) => (
              <span key={i} className="bg-tab text-text-secondary px-2 py-0.5 rounded-full text-[10px]">
                {amenity}
              </span>
            ))}
          </div>
          {/* Available rooms badge */}
          {hotel.room_types?.[0]?.available_rooms !== undefined && (
            <div className="mt-2">
              <span className="bg-success/10 text-success px-2 py-0.5 rounded-full text-[11px] font-medium">
                Con {hotel.room_types[0].available_rooms} phong
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Price & CTA */}
      <div className="p-4 border-t md:border-t-0 md:border-l border-border flex md:flex-col items-center md:items-end justify-between md:justify-between md:w-52">
        <div className="text-left md:text-right">
          <div className="text-[11px] text-text-secondary mb-1">
            {hotel.room_types?.[0]?.bed_type && `${hotel.room_types[0].bed_type} · `}
            {hotel.room_types?.[0]?.max_guests && `Toi da ${hotel.room_types[0].max_guests} khach`}
          </div>
          <div className="text-xl font-bold text-primary">
            {formatPrice(hotel.min_price ?? hotel.room_types?.[0]?.price_per_night ?? 0)}
          </div>
          <div className="text-[11px] text-text-secondary">/dem</div>
        </div>
        <Link
          to={viewRoomLink}
          className="bg-gold text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors mt-2 md:mt-0"
        >
          Xem phong
        </Link>
      </div>
    </div>
  );
}
