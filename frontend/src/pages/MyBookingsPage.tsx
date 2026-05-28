import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../api/bookings';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

const statusLabels: Record<string, string> = {
  pending: 'Cho thanh toan',
  confirmed: 'Da xac nhan',
  cancelled: 'Da huy',
  completed: 'Hoan thanh',
};

export default function MyBookingsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.list().then(r => r.data),
  });

  const bookings = data?.data ?? [];

  const formatPrice = (price: string | number) =>
    Number(price).toLocaleString('vi-VN') + 'd';

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-text tracking-tight mb-6">Dat phong cua toi</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface rounded-2xl shadow-sm h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
        <p className="text-text-secondary">Co loi xay ra. Vui long thu lai.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold text-text tracking-tight mb-6">Dat phong cua toi</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-text font-semibold">Ban chua co dat phong nao</p>
          <p className="text-sm text-text-secondary mt-1">Bat dau tim kiem va dat phong ngay!</p>
          <Link
            to="/search"
            className="inline-block mt-4 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Tim khach san
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <Link
              key={booking.id}
              to={`/bookings/${booking.booking_code}`}
              className="block bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-text">{booking.room_type?.hotel?.name || 'Khach san'}</div>
                  <div className="text-sm text-text-secondary mt-1">{booking.room_type?.name || 'Phong'}</div>
                  <div className="text-sm text-text-secondary mt-1">
                    📅 {booking.check_in} → {booking.check_out} · {booking.nights} dem
                  </div>
                  <div className="text-sm text-text-secondary mt-1">👥 {booking.guests} khach</div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-tab text-text-secondary'}`}>
                    {statusLabels[booking.status] || booking.status}
                  </span>
                  <div className="text-lg font-bold text-primary mt-2">{formatPrice(booking.total_price)}</div>
                  <div className="text-[11px] text-text-secondary">#{booking.booking_code}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
