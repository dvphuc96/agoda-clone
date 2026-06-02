import apiClient from './client';
import type { Hotel } from './hotels';

export type TransferDirection = 'airport_to_hotel' | 'hotel_to_airport';
export type TransferStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface TransferVehicleType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  passenger_capacity: number;
  luggage_capacity: number;
  image: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface TransferRoute {
  id: number;
  airport_code: string;
  airport_name: string;
  pickup_latitude: string | null;
  pickup_longitude: string | null;
  direction: TransferDirection;
  price: string;
  currency: string;
  duration_minutes: number | null;
  distance_meters: number | null;
  distance_km: number | null;
  duration_seconds: number | null;
  base_fee: string;
  price_per_km: string;
  price_override: string | null;
  pricing_source: 'manual' | 'map' | 'override';
  is_active: boolean;
  hotel?: Hotel;
  vehicle_type?: TransferVehicleType;
  created_at?: string;
}

export interface TransferQuote {
  route_id: number;
  airport_code: string;
  airport_name: string;
  direction: TransferDirection;
  price: string;
  currency: string;
  duration_minutes: number | null;
  distance_meters: number | null;
  distance_km: number | null;
  hotel: Hotel;
  vehicle_type: TransferVehicleType;
}

export interface TransferBooking {
  id: number;
  booking_code: string;
  airport_code: string;
  airport_name: string;
  direction: TransferDirection;
  pickup_datetime: string;
  passengers: number;
  contact_name: string;
  contact_phone: string;
  flight_number: string | null;
  special_requests: string | null;
  total_price: string;
  currency: string;
  status: TransferStatus;
  cancelled_at: string | null;
  hotel?: Hotel;
  route?: TransferRoute;
  vehicle_type?: TransferVehicleType;
  user?: { id: number; name: string; email: string; phone?: string | null };
  created_at: string;
}

export interface TransferBookingPayload {
  transfer_route_id: number;
  pickup_datetime: string;
  passengers: number;
  contact_name: string;
  contact_phone: string;
  flight_number?: string;
  special_requests?: string;
}

export interface TransferSearchOptions {
  airports: Array<{ airport_code: string; airport_name: string }>;
  hotels: { data: Hotel[] } | Hotel[];
  directions: TransferDirection[];
}

type ApiResource<T> = T | { data: T };

function unwrapResource<T>(payload: ApiResource<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }

  return payload;
}

export const transfersApi = {
  searchOptions: () => apiClient.get<TransferSearchOptions>('/transfers/search-options'),
  quotes: (params: { airport_code: string; hotel_id: number; direction: TransferDirection; passengers: number }) =>
    apiClient.get<{ data: TransferQuote[] }>('/transfers/quotes', { params }),
  hotelQuotes: (hotelId: number, params: { direction: TransferDirection; passengers: number }) =>
    apiClient.get<{ data: TransferQuote[] }>(`/transfers/hotels/${hotelId}/quotes`, { params }),
  bookings: () => apiClient.get<{ data: TransferBooking[] }>('/transfers/bookings'),
  createBooking: (data: TransferBookingPayload) =>
    apiClient.post<ApiResource<TransferBooking>>('/transfers/bookings', data)
      .then((response) => ({ ...response, data: unwrapResource(response.data) })),
  getBooking: (bookingCode: string) =>
    apiClient.get<ApiResource<TransferBooking>>(`/transfers/bookings/${bookingCode}`)
      .then((response) => ({ ...response, data: unwrapResource(response.data) })),
  cancelBooking: (bookingCode: string) => apiClient.post(`/transfers/bookings/${bookingCode}/cancel`),
};
