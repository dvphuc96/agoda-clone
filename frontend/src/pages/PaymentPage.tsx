import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';
import { paymentsApi } from '../api/payments';

export default function PaymentPage() {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if this is a callback from payment gateway
  const vnpayResponse = searchParams.get('vnp_ResponseCode');
  const momoResult = searchParams.get('resultCode');
  const isCallback = vnpayResponse !== null || momoResult !== null;

  const paymentSuccess = isCallback
    ? (vnpayResponse === '00' || momoResult === '0')
    : null;

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingCode],
    queryFn: () => bookingsApi.get(bookingCode!).then(r => r.data),
    enabled: !!bookingCode,
  });

  const handlePayment = async (method: 'vnpay' | 'momo') => {
    if (!booking) return;
    setError('');
    setLoading(true);
    try {
      const result = await paymentsApi.create(booking.id, method);
      // Redirect to payment gateway
      window.location.href = result.data.payment_url;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Tao thanh toan that bai. Vui long thu lai.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string | number) =>
    Number(price).toLocaleString('vi-VN') + 'd';

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-tab rounded w-1/2 mx-auto" />
          <div className="h-48 bg-tab rounded-2xl" />
        </div>
      </div>
    );
  }

  // Payment callback result
  if (isCallback && paymentSuccess !== null) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-surface rounded-2xl shadow-sm p-8">
          {paymentSuccess ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-text mb-2">Thanh toan thanh cong!</h1>
              <p className="text-sm text-text-secondary mb-2">
                Dat phong <span className="font-semibold text-text">{bookingCode}</span> da duoc xac nhan.
              </p>
              <p className="text-sm text-text-secondary mb-6">Ban se nhan duoc email xac nhan som.</p>
              <div className="flex gap-3 justify-center">
                <Link
                  to={`/bookings/${bookingCode}`}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  Xem chi tiet
                </Link>
                <Link
                  to="/"
                  className="bg-tab text-text-secondary px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-border transition-colors"
                >
                  Ve trang chu
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-text mb-2">Thanh toan that bai</h1>
              <p className="text-sm text-text-secondary mb-6">
                Giao dich khong thanh cong. Vui long thu lai hoac chon phuong thuc khac.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  Thu lai
                </button>
                <Link
                  to={`/bookings/${bookingCode}`}
                  className="bg-tab text-text-secondary px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-border transition-colors"
                >
                  Xem dat phong
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Payment method selection
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text tracking-tight">Thanh toan</h1>
        <p className="text-sm text-text-secondary mt-1">Chon phuong thuc thanh toan cho dat phong cua ban</p>
      </div>

      {/* Booking Summary */}
      {booking && (
        <div className="bg-surface rounded-2xl shadow-sm p-5 mb-6">
          <h3 className="font-bold text-text mb-3">Thong tin dat phong</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Ma dat phong</span>
              <span className="font-medium text-text">{booking.booking_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Khach san</span>
              <span className="font-medium text-text">{booking.room_type?.hotel?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Loai phong</span>
              <span className="font-medium text-text">{booking.room_type?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Ngay nhan</span>
              <span className="font-medium text-text">{booking.check_in}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Ngay tra</span>
              <span className="font-medium text-text">{booking.check_out}</span>
            </div>
            <div className="border-t border-border/50 pt-2 mt-2 flex justify-between">
              <span className="font-bold text-text">Tong cong</span>
              <span className="text-xl font-bold text-primary">{formatPrice(booking.total_price)}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      {/* Payment Methods */}
      <div className="space-y-3">
        <h3 className="font-bold text-text text-sm">Chon phuong thuc thanh toan</h3>

        {/* VNPay */}
        <button
          onClick={() => handlePayment('vnpay')}
          disabled={loading}
          className="w-full bg-surface rounded-2xl shadow-sm border border-border/50 p-5 flex items-center gap-4 hover:border-primary hover:shadow-md transition-all disabled:opacity-50 text-left"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
            💳
          </div>
          <div className="flex-1">
            <div className="font-bold text-text">VNPay</div>
            <div className="text-xs text-text-secondary mt-0.5">Thanh toan qua VNPay - Ho tro ATM, QR, vi dien tu</div>
          </div>
          <div className="text-primary font-semibold text-sm">Chon &rarr;</div>
        </button>

        {/* MoMo */}
        <button
          onClick={() => handlePayment('momo')}
          disabled={loading}
          className="w-full bg-surface rounded-2xl shadow-sm border border-border/50 p-5 flex items-center gap-4 hover:border-primary hover:shadow-md transition-all disabled:opacity-50 text-left"
        >
          <div className="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
            📱
          </div>
          <div className="flex-1">
            <div className="font-bold text-text">MoMo</div>
            <div className="text-xs text-text-secondary mt-0.5">Thanh toan qua vi MoMo - Nhanh chong, tien loi</div>
          </div>
          <div className="text-primary font-semibold text-sm">Chon &rarr;</div>
        </button>
      </div>

      {loading && (
        <div className="text-center mt-4 text-sm text-text-secondary">
          Dang chuyen den cong thanh toan...
        </div>
      )}
    </div>
  );
}
