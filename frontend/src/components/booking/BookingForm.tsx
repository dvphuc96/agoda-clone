import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface BookingFormProps {
  maxGuests: number;
  onSubmit: (data: { check_in: string; check_out: string; guests: number; special_requests: string }) => void;
  loading: boolean;
}

export default function BookingForm({ maxGuests, onSubmit, loading }: BookingFormProps) {
  const [searchParams] = useSearchParams();
  const [checkIn, setCheckIn] = useState(searchParams.get('check_in') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('check_out') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 1);
  const [specialRequests, setSpecialRequests] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ check_in: checkIn, check_out: checkOut, guests, special_requests: specialRequests });
  };

  // Calculate nights
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-text">Thong tin dat phong</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Ngay nhan phong</label>
          <input
            type="date"
            value={checkIn}
            onChange={e => setCheckIn(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Ngay tra phong</label>
          <input
            type="date"
            value={checkOut}
            onChange={e => setCheckOut(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">So luong khach</label>
        <select
          value={guests}
          onChange={e => setGuests(Number(e.target.value))}
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
        >
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>{n} nguoi</option>
          ))}
        </select>
      </div>

      {nights > 0 && (
        <div className="bg-primary/5 text-primary text-sm rounded-lg px-4 py-2.5">
          So dem: <span className="font-semibold">{nights} dem</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Yeu cau dac biet (khong bat buoc)</label>
        <textarea
          value={specialRequests}
          onChange={e => setSpecialRequests(e.target.value)}
          rows={3}
          placeholder="Vi du: Phong tang cao, xem bien..."
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !checkIn || !checkOut}
        className="w-full bg-gold text-white py-3 rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors disabled:opacity-50"
      >
        {loading ? 'Dang xu ly...' : 'Xac nhan dat phong'}
      </button>
    </form>
  );
}
