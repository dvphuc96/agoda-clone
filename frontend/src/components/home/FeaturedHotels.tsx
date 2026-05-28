import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { hotelsApi } from '../../api/hotels';
import HotelCard from './HotelCard';

export default function FeaturedHotels() {
  const { data: hotels } = useQuery({
    queryKey: ['featured-hotels'],
    queryFn: () => hotelsApi.getFeatured().then(r => r.data),
  });

  return (
    <section className="px-4 md:px-8 pb-8">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold text-text tracking-tight">Khach san noi bat</h2>
          <p className="text-sm text-text-secondary mt-0.5">Duoc dat nhieu nhat tuan qua</p>
        </div>
        <Link to="/search" className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
          Kham pha ngay &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotels?.slice(0, 6).map((hotel, idx) => (
          <HotelCard key={hotel.id} hotel={hotel} index={idx} />
        ))}
      </div>
    </section>
  );
}
