import type { Hotel, Location } from '../api/hotels';

const destinationImages: Record<string, string> = {
  'ha-noi': 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=900&q=80',
  sapa: 'https://images.unsplash.com/photo-1531867330787-86dbbcd8b6d8?auto=format&fit=crop&w=900&q=80',
  hue: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
  'da-nang': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
  'hoi-an': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
  'nha-trang': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80',
  'tp-hcm': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80',
  'phu-quoc': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
};

const destinationBackdrops = [
  'linear-gradient(135deg, #21473f 0%, #5e7f73 48%, #d6b06d 100%)',
  'linear-gradient(135deg, #1f3b4d 0%, #6f8ea1 48%, #d8c7a3 100%)',
  'linear-gradient(135deg, #513a2d 0%, #a16642 48%, #e7c891 100%)',
  'linear-gradient(135deg, #173b38 0%, #3f7b84 52%, #d4b07a 100%)',
  'linear-gradient(135deg, #2c2f45 0%, #796788 50%, #e0b16a 100%)',
  'linear-gradient(135deg, #153b4c 0%, #2e8c9b 52%, #e6c78a 100%)',
  'linear-gradient(135deg, #252c35 0%, #636b6d 52%, #caa56a 100%)',
  'linear-gradient(135deg, #173f36 0%, #4aa08f 52%, #e1bd78 100%)',
];

const hotelFallbacks = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
];

const hotelBackdrops = [
  'linear-gradient(135deg, #18201d 0%, #58766f 52%, #d7aa63 100%)',
  'linear-gradient(135deg, #263238 0%, #7b8f8a 50%, #e1c28a 100%)',
  'linear-gradient(135deg, #2b211c 0%, #8a6248 52%, #d9b77c 100%)',
  'linear-gradient(135deg, #102f35 0%, #477f88 52%, #e0c387 100%)',
  'linear-gradient(135deg, #1e293b 0%, #6d7280 52%, #d8ad6a 100%)',
];

function formatVnd(price: string | number | null | undefined) {
  const value = Number(price ?? 0);
  return Number.isFinite(value) && value > 0 ? `${value.toLocaleString('vi-VN')}đ` : 'Liên hệ';
}

export function locationImage(location: Location) {
  return location.image || destinationImages[location.slug] || destinationImages['da-nang'];
}

export function hotelImage(hotel: Hotel, index = 0) {
  const firstImage = hotel.images?.[0]?.image_path;

  if (firstImage?.startsWith('http') || firstImage?.startsWith('/')) {
    return firstImage;
  }

  if (firstImage) {
    return `/storage/${firstImage}`;
  }

  return hotelFallbacks[index % hotelFallbacks.length];
}

function fallbackHotelImage(index = 0) {
  return hotelFallbacks[index % hotelFallbacks.length];
}

export function locationBackdrop(index = 0) {
  return {
    backgroundImage: destinationBackdrops[index % destinationBackdrops.length],
  };
}

export function hotelBackdrop(index = 0) {
  return {
    backgroundImage: hotelBackdrops[index % hotelBackdrops.length],
  };
}

export function amenityLabel(amenity: string, labels?: Record<string, string>) {
  return labels?.[amenity] || amenity;
}
