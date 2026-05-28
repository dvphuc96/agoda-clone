import apiClient from './client';

export interface Destination {
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
  available_rooms?: number;
}

export interface Hotel {
  id: number;
  name: string;
  slug: string;
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
  destination: Destination;
  images: HotelImage[];
  room_types: RoomType[];
  min_price?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface HotelSearchParams {
  destination?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  star?: number;
  price_min?: number;
  price_max?: number;
  sort?: string;
  page?: number;
}

export const hotelsApi = {
  getDestinations: () => apiClient.get<Destination[]>('/destinations'),

  getDestinationHotels: (slug: string) => apiClient.get<PaginatedResponse<Hotel>>(`/destinations/${slug}/hotels`),

  searchHotels: (params: HotelSearchParams) => apiClient.get<PaginatedResponse<Hotel>>('/hotels', { params }),

  getFeatured: () => apiClient.get<Hotel[]>('/hotels/featured'),

  getHotel: (slug: string) => apiClient.get<Hotel>(`/hotels/${slug}`),

  getRooms: (slug: string, checkIn: string, checkOut: string) =>
    apiClient.get<RoomType[]>(`/hotels/${slug}/rooms`, { params: { check_in: checkIn, check_out: checkOut } }),
};
