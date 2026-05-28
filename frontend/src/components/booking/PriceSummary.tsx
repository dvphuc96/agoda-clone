import type { RoomType } from '../../api/hotels';

interface PriceSummaryProps {
  room: RoomType;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
}

export default function PriceSummary({ room, hotelName, checkIn, checkOut, nights, guests }: PriceSummaryProps) {
  const formatPrice = (price: string | number) =>
    Number(price).toLocaleString('vi-VN') + 'd';

  const pricePerNight = Number(room.price_per_night);
  const totalPrice = pricePerNight * nights;

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border/50 p-6 sticky top-4">
      <h3 className="font-bold text-text mb-4">Chi tiet gia</h3>

      {/* Room & Hotel Info */}
      <div className="space-y-2 mb-4 pb-4 border-b border-border/50">
        <div className="font-medium text-text">{room.name}</div>
        <div className="text-sm text-text-secondary">{hotelName}</div>
        {checkIn && checkOut && (
          <div className="text-sm text-text-secondary">
            {checkIn} → {checkOut}
          </div>
        )}
        <div className="text-sm text-text-secondary">{guests} khach</div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 mb-4 pb-4 border-b border-border/50">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">{formatPrice(room.price_per_night)} x {nights} dem</span>
          <span className="text-text">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Thue & phi</span>
          <span className="text-text">0d</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="font-bold text-text">Tong cong</span>
        <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
      </div>
    </div>
  );
}
