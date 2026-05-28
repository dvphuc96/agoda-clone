import { Link, useSearchParams } from 'react-router-dom';
import type { RoomType } from '../../api/hotels';

const gradients = [
  'from-blue-50 to-blue-200',
  'from-sky-50 to-sky-200',
  'from-amber-50 to-amber-200',
  'from-emerald-50 to-emerald-200',
];

export default function RoomTypeCard({ room, index }: { room: RoomType; index: number }) {
  const [searchParams] = useSearchParams();
  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';

  const formatPrice = (price: string | number) =>
    Number(price).toLocaleString('vi-VN') + 'd';

  const bookingLink = checkIn && checkOut
    ? `/booking/${room.id}?check_in=${checkIn}&check_out=${checkOut}`
    : `/booking/${room.id}`;

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border/50 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Room Image */}
        <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} w-full md:w-56 h-40 md:h-auto shrink-0 flex items-center justify-center`}>
          {room.images?.[0]?.image_path ? (
            <img src={room.images[0].image_path} alt={room.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">🛏️</span>
          )}
        </div>

        {/* Room Info */}
        <div className="flex-1 p-4">
          <h3 className="font-bold text-text">{room.name}</h3>

          <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-secondary">
            {room.bed_type && (
              <span className="bg-tab px-2 py-1 rounded">🛏 {room.bed_type}</span>
            )}
            <span className="bg-tab px-2 py-1 rounded">👥 Toi da {room.max_guests} khach</span>
            {room.size_sqm && (
              <span className="bg-tab px-2 py-1 rounded">📐 {room.size_sqm} m²</span>
            )}
            <span className="bg-tab px-2 py-1 rounded">🏠 {room.total_rooms} phong</span>
          </div>

          {room.description && (
            <p className="text-xs text-text-secondary mt-2 line-clamp-2">{room.description}</p>
          )}

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {room.amenities.slice(0, 6).map((amenity, i) => (
                <span key={i} className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded-full">
                  {amenity}
                </span>
              ))}
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <div>
              <span className="text-xl font-bold text-primary">{formatPrice(room.price_per_night)}</span>
              <span className="text-xs text-text-secondary"> /dem</span>
              {room.available_rooms !== undefined && (
                <div className="text-[11px] text-success font-medium mt-0.5">
                  Con {room.available_rooms} phong trong
                </div>
              )}
            </div>
            <Link
              to={bookingLink}
              className="bg-gold text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors"
            >
              Dat phong
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
