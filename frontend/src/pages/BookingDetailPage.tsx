import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
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

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
};

export default function BookingDetailPage() {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const queryClient = useQueryClient();

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', bookingCode],
    queryFn: () => bookingsApi.get(bookingCode!).then(r => r.data),
    enabled: !!bookingCode,
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancel(bookingCode!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingCode] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });

  const formatPrice = (price: string | number) =>
    Number(price).toLocaleString('vi-VN') + 'd';

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-tab rounded w-1/3" />
          <div className="h-64 bg-tab rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-text">Khong tim thay dat phong</h2>
        <Link to="/bookings" className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg font-semibold text-sm">
          Quay lai danh sach
        </Link>
      </div>
    );
  }

  const latestPayment = booking.payments?.[0];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Trang chu</Link>
        <span>/</span>
        <Link to="/bookings" className="hover:text-primary transition-colors">Dat phong</Link>
        <span>/</span>
        <span className="text-text">#{booking.booking_code}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Chi tiet dat phong</h1>
          <div className="text-sm text-text-secondary mt-1">Ma dat phong: #{booking.booking_code}</div>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusColors[booking.status] || 'bg-tab text-text-secondary'}`}>
          {statusLabels[booking.status] || booking.status}
        </span>
      </div>

      {/* Booking Details Card */}
      <div className="bg-surface rounded-2xl shadow-sm p-6 mb-4">
        <h3 className="font-bold text-text mb-4">Thong tin dat phong</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-text-secondary">Khach san</div>
            <div className="font-medium text-text mt-0.5">{booking.room_type?.hotel?.name}</div>
          </div>
          <div>
            <div className="text-text-secondary">Loai phong</div>
            <div className="font-medium text-text mt-0.5">{booking.room_type?.name}</div>
          </div>
          <div>
            <div className="text-text-secondary">Ngay nhan phong</div>
            <div className="font-medium text-text mt-0.5">{booking.check_in}</div>
          </div>
          <div>
            <div className="text-text-secondary">Ngay tra phong</div>
            <div className="font-medium text-text mt-0.5">{booking.check_out}</div>
          </div>
          <div>
            <div className="text-text-secondary">So dem</div>
            <div className="font-medium text-text mt-0.5">{booking.nights} dem</div>
          </div>
          <div>
            <div className="text-text-secondary">So khach</div>
            <div className="font-medium text-text mt-0.5">{booking.guests} nguoi</div>
          </div>
          {booking.special_requests && (
            <div className="col-span-2">
              <div className="text-text-secondary">Yeu cau dac biet</div>
              <div className="font-medium text-text mt-0.5">{booking.special_requests}</div>
            </div>
          )}
        </div>

        <div className="border-t border-border/50 mt-4 pt-4 flex justify-between items-center">
          <span className="font-bold text-text">Tong cong</span>
          <span className="text-xl font-bold text-primary">{formatPrice(booking.total_price)}</span>
        </div>
      </div>

      {/* Payment Info Card */}
      {latestPayment && (
        <div className="bg-surface rounded-2xl shadow-sm p-6 mb-4">
          <h3 className="font-bold text-text mb-4">Thong tin thanh toan</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-text-secondary">Phuong thuc</div>
              <div className="font-medium text-text mt-0.5">
                {latestPayment.payment_method === 'vnpay' ? 'VNPay' : 'MoMo'}
              </div>
            </div>
            <div>
              <div className="text-text-secondary">Trang thai</div>
              <span className={`inline-block mt-0.5 px-3 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[latestPayment.status] || 'bg-tab text-text-secondary'}`}>
                {latestPayment.status === 'success' ? 'Thanh cong' :
                 latestPayment.status === 'pending' ? 'Cho thanh toan' :
                 latestPayment.status === 'failed' ? 'That bai' : 'Hoan tien'}
              </span>
            </div>
            {latestPayment.paid_at && (
              <div>
                <div className="text-text-secondary">Ngay thanh toan</div>
                <div className="font-medium text-text mt-0.5">{latestPayment.paid_at}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        {booking.status === 'pending' && (
          <>
            <Link
              to={`/payment/${booking.booking_code}`}
              className="bg-gold text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors"
            >
              Thanh toan ngay
            </Link>
            <button
              onClick={() => {
                if (confirm('Ban co chac chan muon huy dat phong nay?')) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
              className="bg-red-50 text-red-600 border border-red-200 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {cancelMutation.isPending ? 'Dang huy...' : 'Huy dat phong'}
            </button>
          </>
        )}
        <Link
          to="/bookings"
          className="bg-tab text-text-secondary px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-border transition-colors"
        >
          Quay lai
        </Link>
      </div>

      {cancelMutation.isError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
          Huy dat phong that bai. Vui long thu lai.
        </div>
      )}
    </div>
  );
}
