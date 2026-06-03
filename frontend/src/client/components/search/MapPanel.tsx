import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';
import { mapApi, type MapHotel, type MapBounds } from '../../../shared/api/map';
import { useI18n } from '../../../shared/i18n/useI18n';
import MapMarker from './MapMarker';

import 'leaflet/dist/leaflet.css';

// Fix default marker icons for Vite/webpack builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Vietnam center coordinates
const DEFAULT_CENTER: [number, number] = [14.0583, 108.2772];
const DEFAULT_ZOOM = 6;

interface BoundsListenerProps {
  onBoundsChange: (bounds: MapBounds) => void;
}

function BoundsListener({ onBoundsChange }: BoundsListenerProps) {
  const map = useMap();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitBounds = useCallback(() => {
    const b = map.getBounds();
    onBoundsChange({
      ne_lat: b.getNorthEast().lat,
      ne_lng: b.getNorthEast().lng,
      sw_lat: b.getSouthWest().lat,
      sw_lng: b.getSouthWest().lng,
    });
  }, [map, onBoundsChange]);

  useEffect(() => {
    // Emit initial bounds
    emitBounds();

    const onMoveEnd = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(emitBounds, 300);
    };

    map.on('moveend', onMoveEnd);
    return () => {
      map.off('moveend', onMoveEnd);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [map, emitBounds]);

  return null;
}

interface MapPanelProps {
  className?: string;
  locationId?: number;
}

export default function MapPanel({ className = '', locationId }: MapPanelProps) {
  const { t } = useI18n();
  const [hotels, setHotels] = useState<MapHotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const boundsRef = useRef<MapBounds | null>(null);

  const fetchHotels = useCallback(async (bounds: MapBounds) => {
    boundsRef.current = bounds;
    setLoading(true);
    try {
      const response = await mapApi.getHotelsInBounds({
        ...bounds,
        ...(locationId ? { location_id: locationId } : {}),
      });
      setHotels(response.data.data ?? []);
      setTotalCount(response.data.meta?.total ?? 0);
    } catch {
      // silently ignore - map will just show no markers
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    void fetchHotels(bounds);
  }, [fetchHotels]);

  return (
    <div className={`relative flex flex-col ${className}`}>
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-text-secondary">
          {loading
            ? t('map.loading')
            : t('map.hotelsInArea', { count: totalCount })}
        </p>
        {loading && <Loader2 className="size-4 animate-spin text-primary" />}
      </div>
      <div className="relative flex-1 overflow-hidden rounded-xl border border-border">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
          style={{ minHeight: '400px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <BoundsListener onBoundsChange={handleBoundsChange} />
          {hotels.map(hotel => (
            <MapMarker key={hotel.id} hotel={hotel} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
