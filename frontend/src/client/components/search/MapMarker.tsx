import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import type { MapHotel } from '../../../shared/api/map';
import { useI18n } from '../../../shared/i18n/useI18n';

interface MapMarkerProps {
  hotel: MapHotel;
}

const priceFormatter = new Intl.NumberFormat('vi-VN');

export default function MapMarker({ hotel }: MapMarkerProps) {
  const { t, locale } = useI18n();
  const detailPath = locale === 'vi' ? `/vi/hotels/${hotel.slug}` : `/hotels/${hotel.slug}`;

  return (
    <Marker position={[hotel.latitude, hotel.longitude]}>
      <Popup className="map-popup" maxWidth={220}>
        <div className="flex flex-col gap-2 p-1">
          {hotel.thumbnail && (
            <img
              src={hotel.thumbnail}
              alt={hotel.name}
              className="h-28 w-full rounded-md object-cover"
              loading="lazy"
            />
          )}
          <div>
            <p className="text-sm font-semibold leading-tight text-gray-900">{hotel.name}</p>
            <div className="mt-0.5 flex items-center gap-1">
              {Array.from({ length: hotel.star_rating }).map((_, i) => (
                <span key={i} className="text-xs text-amber-500">&#9733;</span>
              ))}
            </div>
          </div>
          {hotel.min_price != null && (
            <p className="text-sm font-bold text-primary">
              {priceFormatter.format(hotel.min_price)}đ<span className="font-normal text-gray-500">/night</span>
            </p>
          )}
          <Link
            to={detailPath}
            className="inline-flex items-center justify-center rounded-md bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary"
          >
            {t('map.viewDetails')}
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}
