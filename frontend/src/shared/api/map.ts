import apiClient from './client';

export interface MapHotel {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  star_rating: number;
  thumbnail: string | null;
  min_price: number | null;
}

export interface MapBounds {
  ne_lat: number;
  ne_lng: number;
  sw_lat: number;
  sw_lng: number;
  location_id?: number;
}

export interface MapHotelsResponse {
  data: MapHotel[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const mapApi = {
  getHotelsInBounds: (bounds: MapBounds) =>
    apiClient.get<MapHotelsResponse>('/map/hotels', { params: bounds }),
};
