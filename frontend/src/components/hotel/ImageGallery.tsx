import { useState } from 'react';
import type { HotelImage } from '../../api/hotels';

export default function ImageGallery({ images, hotelName }: { images: HotelImage[]; hotelName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden h-64 md:h-96 bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
        <span className="text-6xl">🏨</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="rounded-2xl overflow-hidden h-64 md:h-96">
        <img
          src={images[selectedIndex]?.image_path}
          alt={images[selectedIndex]?.caption || hotelName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(idx)}
              className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === selectedIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img src={img.image_path} alt={img.caption || ''} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
