import apiClient from './client';

export interface Location {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  region: string;
  hotels_count?: number;
}

export interface HotelImage {
  id: number;
  image_path: string;
  caption: string | null;
  sort_order: number;
}

export interface RoomType {
  id: number;
  name: string;
  description: string | null;
  max_guests: number;
  bed_type: string;
  size_sqm: number | null;
  price_per_night: string;
  amenities: string[] | null;
  total_rooms: number;
  images: HotelImage[];
  hotel?: Hotel;
  available_rooms?: number;
}

export interface Hotel {
  id: number;
  name: string;
  slug: string;
  property_type: 'hotel' | 'villa' | 'resort' | 'apartment';
  description: string | null;
  address: string;
  star_rating: number;
  latitude: string | null;
  longitude: string | null;
  phone: string | null;
  email: string | null;
  checkin_time: string;
  checkout_time: string;
  amenities: string[] | null;
  status: string;
  location: Location;
  images: HotelImage[];
  room_types: RoomType[];
  min_price?: string;
  max_price?: string;
  reviews_count?: number;
  avg_rating?: number | null;
  latest_reviews?: import('./reviews').Review[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ResourceCollection<T> {
  data: T[];
}

type CollectionPayload<T> = T[] | ResourceCollection<T> | { data: ResourceCollection<T> };
type ApiResource<T> = T | { data: T };

function unwrapResource<T>(payload: ApiResource<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }

  return payload;
}

export function getCollectionData<T>(payload: CollectionPayload<T> | unknown): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    return [];
  }

  const data = (payload as { data: unknown }).data;

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (data && typeof data === 'object' && 'data' in data) {
    const nestedData = (data as { data: unknown }).data;
    return Array.isArray(nestedData) ? nestedData as T[] : [];
  }

  return [];
}

export interface HotelSearchParams {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  star?: number;
  price_min?: number;
  price_max?: number;
  types?: string;
  amenities?: string;
  sort?: string;
  page?: number;
}

export const hotelsApi = {
  getLocations: () => apiClient.get<ResourceCollection<Location> | Location[]>('/locations'),

  getLocationHotels: (slug: string) => apiClient.get<PaginatedResponse<Hotel>>(`/locations/${slug}/hotels`),

  searchHotels: (params: HotelSearchParams) => apiClient.get<PaginatedResponse<Hotel>>('/hotels', { params }),

  getFeatured: () => apiClient.get<ResourceCollection<Hotel> | Hotel[]>('/hotels/featured'),

  getHotel: (slug: string) =>
    apiClient.get<ApiResource<Hotel>>(`/hotels/${slug}`)
      .then((response) => ({ ...response, data: unwrapResource(response.data) })),

  getRooms: (slug: string, checkIn: string, checkOut: string) =>
    apiClient.get<ResourceCollection<RoomType> | RoomType[]>(`/hotels/${slug}/rooms`, { params: { check_in: checkIn, check_out: checkOut } }),

  getRoomType: (roomTypeId: number | string, params?: { check_in?: string; check_out?: string }) =>
    apiClient.get<ApiResource<RoomType>>(`/room-types/${roomTypeId}`, { params })
      .then((response) => ({ ...response, data: unwrapResource(response.data) })),
};
