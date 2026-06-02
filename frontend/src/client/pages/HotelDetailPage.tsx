import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { getCollectionData, hotelsApi, type RoomType } from '../../shared/api/hotels';
import { useI18n } from '../../shared/i18n/useI18n';
import ImageGallery from '../components/hotel/ImageGallery';
import HotelInfo from '../components/hotel/HotelInfo';
import RoomTypeCard from '../components/hotel/RoomTypeCard';
import WishlistButton from '../components/hotel/WishlistButton';
import { getRoomsSectionLinkClasses } from '../components/hotel/roomsSectionState';

const vndFormatter = new Intl.NumberFormat('vi-VN');

export default function HotelDetailPage() {
  const { t } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const { data: hotel, isLoading, isError } = useQuery({
    queryKey: ['hotel', slug],
    queryFn: () => hotelsApi.getHotel(slug!).then(r => r.data),
    enabled: !!slug,
  });

  const { data: rooms } = useQuery({
    queryKey: ['hotel-rooms', slug, checkIn, checkOut],
    queryFn: () => hotelsApi.getRooms(slug!, checkIn, checkOut).then(r => getCollectionData<RoomType>(r.data)),
    enabled: !!slug && !!checkIn && !!checkOut,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="space-y-6">
          <div className="skeleton h-4 w-1/3 rounded-full" />
          <div className="skeleton h-[420px] rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !hotel) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center md:px-8">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-7 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-text">{t('hotel.notFoundTitle')}</h2>
        <p className="mt-2 text-sm text-text-secondary">{t('hotel.notFoundBody')}</p>
        <Link to="/search" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-spring-fast hover:bg-primary-hover">
          {t('hotel.backToSearch')}
        </Link>
      </div>
    );
  }

  const displayRooms = rooms && rooms.length > 0 ? rooms : hotel.room_types ?? [];
  const isRoomsSectionActive = selectedRoomId !== null;

  return (
    <div className="bg-bg">
      {/* Breadcrumb */}
      <div className="border-b border-border/50 bg-surface">
        <div className="mx-auto flex max-w-6xl items-center gap-1.5 px-4 py-3 text-xs text-text-secondary md:px-8">
          <Link to="/" className="transition-spring-fast hover:text-primary">{t('common.home')}</Link>
          <ChevronRight className="size-3" />
          <Link to="/search" className="transition-spring-fast hover:text-primary">{t('common.search')}</Link>
          <ChevronRight className="size-3" />
          <span className="font-medium text-text">{hotel.name}</span>
        </div>
      </div>

      {/* Gallery */}
      <div className="mx-auto max-w-6xl px-4 pt-5 md:px-8">
        <ImageGallery images={hotel.images ?? []} hotelName={hotel.name} />
        <div className="mt-3 flex items-center justify-end gap-2">
          <WishlistButton hotelId={hotel.id} initialWishlisted={hotel.is_wishlisted} />
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left column: Hotel Info + Rooms */}
          <div className="space-y-8">
            {/* Hotel Info */}
            <HotelInfo hotel={hotel} />

            {/* Rooms section */}
            <div id="rooms" className="scroll-mt-24">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-text">{t('hotel.rooms')}</h2>
                <span className="text-xs text-text-secondary">{t('hotel.includedTaxes')}</span>
              </div>
              {displayRooms.length === 0 ? (
                <div className="rounded-2xl bg-warm-surface p-8 text-center">
                  <p className="text-sm text-text-secondary">{t('hotel.noRooms')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayRooms.map((room, idx) => (
                    <RoomTypeCard
                      key={room.id}
                      room={room}
                      index={idx}
                      isSelected={selectedRoomId === String(room.id)}
                      hasSelectedRoom={isRoomsSectionActive}
                      onSelect={setSelectedRoomId}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar — sticky on desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* Quick booking card */}
              <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5">
                <h3 className="font-bold text-text">{hotel.name}</h3>
                <p className="mt-1 text-xs text-text-secondary">{hotel.address}, {hotel.location?.name}</p>
                <div className="mt-4 flex items-center gap-0.5">
                  {hotel.star_rating > 0 && Array.from({ length: hotel.star_rating }).map((_, i) => (
                    <span key={i} className="text-xs text-gold-light">&#9733;</span>
                  ))}
                </div>
                {hotel.min_price && (
                  <div className="mt-4 rounded-xl bg-primary/5 p-3">
                    <div className="text-[11px] font-medium text-text-secondary">{t('common.from')}</div>
                    <div className="text-xl font-bold text-primary">{vndFormatter.format(Number(hotel.min_price))} VND</div>
                    <div className="text-[11px] text-text-secondary">{t('hotel.perNight')}</div>
                  </div>
                )}
                <Link
                  to="#rooms"
                  aria-current={isRoomsSectionActive ? 'true' : undefined}
                  className={getRoomsSectionLinkClasses(isRoomsSectionActive)}
                >
                  {t('hotel.rooms')}
                </Link>
              </div>

              {/* Trust card */}
              <div className="rounded-2xl bg-surface p-5 ring-1 ring-black/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">{t('hotel.trustSecurePayment')}</h4>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="size-1.5 shrink-0 rounded-full bg-success" />
                    {t('hotel.trustFreeCancel')}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="size-1.5 shrink-0 rounded-full bg-success" />
                    {t('hotel.trustInstantConfirm')}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="size-1.5 shrink-0 rounded-full bg-success" />
                    {t('hotel.trustSecurePayment')}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
