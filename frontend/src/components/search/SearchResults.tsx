import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { hotelsApi, type HotelSearchParams } from '../../api/hotels';
import HotelSearchCard from './HotelSearchCard';
import SortBar from './SortBar';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: HotelSearchParams = {
    destination: searchParams.get('destination') || undefined,
    check_in: searchParams.get('check_in') || undefined,
    check_out: searchParams.get('check_out') || undefined,
    guests: searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined,
    star: searchParams.get('star') ? Number(searchParams.get('star')) : undefined,
    price_min: searchParams.get('price_min') ? Number(searchParams.get('price_min')) : undefined,
    price_max: searchParams.get('price_max') ? Number(searchParams.get('price_max')) : undefined,
    sort: searchParams.get('sort') || undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search-hotels', params],
    queryFn: () => hotelsApi.searchHotels(params).then(r => r.data),
  });

  const goToPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(page));
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <SortBar />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface rounded-2xl shadow-sm h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 text-center py-12">
        <p className="text-text-secondary">Co loi xay ra khi tim kiem. Vui long thu lai.</p>
      </div>
    );
  }

  const hotels = data?.data ?? [];
  const currentPage = data?.current_page ?? 1;
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="flex-1">
      <SortBar />

      {total > 0 && (
        <p className="text-sm text-text-secondary mb-4">
          Tim thay <span className="font-semibold text-text">{total}</span> khach san
        </p>
      )}

      {hotels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-text font-semibold">Khong tim thay khach san nao</p>
          <p className="text-sm text-text-secondary mt-1">Thu thay doi bo loc tim kiem</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {hotels.map((hotel, idx) => (
              <HotelSearchCard key={hotel.id} hotel={hotel} index={idx} />
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-tab transition-colors"
              >
                Truoc
              </button>
              {Array.from({ length: lastPage }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-white'
                      : 'border border-border text-text-secondary hover:bg-tab'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-tab transition-colors"
              >
                Tiep
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
