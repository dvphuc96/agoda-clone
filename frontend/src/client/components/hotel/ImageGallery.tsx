import { useState, useRef, useEffect, useCallback } from 'react';
import { Building2, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HotelImage } from '../../../shared/api/hotels';
import { useI18n } from '../../../shared/i18n/useI18n';

export default function ImageGallery({ images, hotelName }: { images: HotelImage[]; hotelName: string }) {
  const { t } = useI18n();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const lightboxRef = useRef<HTMLDialogElement>(null);
  const fallbackAlt = hotelName || t('common.brand');

  const openLightbox = useCallback((idx: number) => {
    setSelectedIndex(idx);
    lightboxRef.current?.showModal();
  }, []);

  const closeLightbox = useCallback(() => {
    lightboxRef.current?.close();
  }, []);

  const goNext = useCallback(() => setSelectedIndex(i => (i + 1) % images.length), [images.length]);
  const goPrev = useCallback(() => setSelectedIndex(i => (i - 1 + images.length) % images.length), [images.length]);

  // Arrow key navigation inside lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightboxRef.current?.open) return;
      if (e.key === 'ArrowRight') setSelectedIndex(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setSelectedIndex(i => (i - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-tab to-border md:h-[420px]">
        <Building2 className="size-16 text-text-secondary/30" />
      </div>
    );
  }

  const mainImage = images[0];
  const sideImages = images.slice(1, 5);

  return (
    <>
      {/* Agoda-style grid: 1 large + up to 4 small */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:grid-rows-2 md:h-[420px]">
        {/* Main large image */}
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="group relative col-span-1 row-span-2 overflow-hidden rounded-2xl md:col-span-2 md:rounded-l-2xl md:rounded-r-none"
        >
          <img
            src={mainImage.image_path}
            alt={mainImage.caption || fallbackAlt}
            className="h-64 w-full object-cover transition-spring group-hover:scale-[1.03] md:h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-spring group-hover:opacity-100" />
        </button>

        {/* Side images — 2x2 grid on desktop */}
        {sideImages.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            onClick={() => openLightbox(idx + 1)}
            className="group relative hidden overflow-hidden md:block"
          >
            <img
              src={img.image_path}
              alt={img.caption || fallbackAlt}
              className="h-full w-full object-cover transition-spring group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-spring group-hover:opacity-100" />
            {/* "View all" overlay on last visible side image */}
            {idx === 3 && images.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white backdrop-blur-[2px]">
                <Camera className="mr-2 size-4" />
                +{images.length - 5}
              </div>
            )}
          </button>
        ))}

        {/* Fill empty side cells on desktop */}
        {Array.from({ length: Math.max(0, 4 - sideImages.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="hidden items-center justify-center bg-gradient-to-br from-tab to-border md:flex">
            <Building2 className="size-8 text-text-secondary/20" />
          </div>
        ))}
      </div>

      {/* View all photos button */}
      {images.length > 1 && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-text shadow-sm ring-1 ring-black/5 transition-spring-fast hover:bg-warm-surface"
          >
            <Camera className="size-3.5 text-primary" />
            {t('hotel.viewAllPhotos', { count: images.length })}
          </button>
        </div>
      )}

      {/* Lightbox using native <dialog> */}
      <dialog
        ref={lightboxRef}
        className="m-0 max-h-full max-w-full bg-transparent p-0 backdrop:bg-black/90 backdrop:backdrop-blur-sm"
      >
        <div
          role="presentation"
          className="fixed inset-0 flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
          onKeyDown={() => {}}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-spring-fast hover:bg-white/20"
          >
            <X className="size-5" />
          </button>

          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-spring-fast hover:bg-white/20"
          >
            <ChevronLeft className="size-5" />
          </button>

          <img
            src={images[selectedIndex]?.image_path}
            alt={images[selectedIndex]?.caption || fallbackAlt}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
          />

          <button
            type="button"
            onClick={goNext}
            className="absolute right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-spring-fast hover:bg-white/20"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium text-white/70">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      </dialog>
    </>
  );
}
