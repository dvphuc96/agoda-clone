import { Link } from 'react-router-dom';
import type { Hotel } from '../../api/hotels';

const gradients = [
  'from-blue-100 to-blue-300',
  'from-sky-100 to-sky-300',
  'from-amber-100 to-amber-300',
  'from-emerald-100 to-emerald-300',
  'from-violet-100 to-violet-300',
];

export default function HotelCard({ hotel, index }: { hotel: Hotel; index: number }) {
  const formatPrice = (price: string | number) =>
    Number(price).toLocaleString('vi-VN') + 'd';

  return (
    <Link to={`/hotel/${hotel.slug}`}
      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-surface group">
      <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} h-40 flex items-center justify-center`}>
        {hotel.images?.[0]?.image_path ? (
          <img src={hotel.images[0].image_path} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">🏨</span>
        )}
      </div>
      <div className="p-4">
        <div className="font-bold text-text">{hotel.name}</div>
        <div className="text-xs text-text-secondary mt-1">
          📍 {hotel.destination?.name} · {'⭐'.repeat(hotel.star_rating)}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-primary">{formatPrice(hotel.min_price ?? hotel.room_types?.[0]?.price_per_night ?? 0)}</span>
            <span className="text-xs text-text-secondary"> /dem</span>
          </div>
          <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-[11px] font-semibold">
            Dat ngay
          </span>
        </div>
      </div>
    </Link>
  );
}
