import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { hotelsApi } from '../../api/hotels';

const gradients = [
  'from-navy to-blue-400',
  'from-cyan-600 to-cyan-400',
  'from-violet-600 to-violet-400',
  'from-emerald-600 to-emerald-400',
  'from-amber-600 to-amber-400',
  'from-rose-600 to-rose-400',
  'from-teal-600 to-teal-400',
  'from-sky-600 to-sky-400',
];

export default function DestinationGrid() {
  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => hotelsApi.getDestinations().then(r => r.data),
  });

  return (
    <section className="px-4 md:px-8 py-8">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold text-text tracking-tight">Diem den noi bat</h2>
          <p className="text-sm text-text-secondary mt-0.5">Nhung noi duoc yeu thich nhat</p>
        </div>
        <Link to="/search" className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
          Tat ca dia dien &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {destinations?.slice(0, 8).map((dest, idx) => (
          <Link key={dest.id} to={`/search?destination=${dest.slug}`}
            className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            <div className={`bg-gradient-to-br ${gradients[idx % gradients.length]} h-36 flex items-end p-4`}>
              <div>
                <div className="text-white font-bold text-lg">{dest.name}</div>
                <div className="text-white/80 text-xs">{dest.hotels_count ?? 0} noi luu tru</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
