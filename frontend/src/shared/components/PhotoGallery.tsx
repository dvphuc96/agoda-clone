import { useState } from 'react';
import { Camera } from 'lucide-react';
import Lightbox from './Lightbox';

interface GalleryImage {
  image_path: string;
  caption?: string;
}

interface PhotoGalleryProps {
  images: GalleryImage[];
}

export default function PhotoGallery({ images }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const visibleImages = images.slice(0, 5);
  const hasMore = images.length > 5;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleImages.map((img, idx) => {
          const isLast = idx === visibleImages.length - 1;
          const isLarge = idx === 0;

          return (
            <button
              key={`${img.image_path}-${idx}`}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              className={`group relative overflow-hidden rounded-xl bg-warm-surface ${
                isLarge ? 'col-span-2 row-span-2' : ''
              }`}
            >
              <img
                src={img.image_path}
                alt={img.caption || ''}
                className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] ${
                  isLarge ? 'h-64 md:h-80' : 'h-32 md:h-40'
                }`}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              {isLast && hasMore && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white backdrop-blur-[2px]">
                  <Camera className="mr-2 size-4" />
                  View all {images.length} photos
                </div>
              )}
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
