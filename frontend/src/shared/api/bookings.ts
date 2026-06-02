import apiClient from './client';
import type { Hotel, RoomType } from './hotels';
import type { CancellationPolicySummary } from './policies';
import type { Refund } from './refunds';
import type { TransferBooking } from './transfers';

export interface Payment {
  id: number;
  booking_id: number;
  payment_method: 'vnpay' | 'momo';
  transaction_id: string | null;
  amount: string;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paid_at: string | null;
  created_at: string;
}

export interface Booking {
  id: number;
  booking_code: string;
  check_in: string;
  check_out: string;
  guests: number;
  special_requests: string | null;
  total_price: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  nights: number;
  cancellation: CancellationPolicySummary | null;
  room_type: RoomType & { hotel: Hotel };
  payments: Payment[];
  refunds: Refund[];
  transfer_bookings?: TransferBooking[];
  created_at: string;
}

export interface CreateBookingData {
  room_type_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  special_requests?: string;
  transfer_add_on?: {
    transfer_route_id: number;
    pickup_datetime: string;
    contact_name: string;
    contact_phone: string;
    flight_number?: string;
    special_requests?: string;
  };
}

type ApiResource<T> = T | { data: T };

function unwrapResource<T>(payload: ApiResource<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }

  return payload;
}

export const bookingsApi = {
  list: () => apiClient.get<{ data: Booking[] }>('/bookings'),

  get: (bookingCode: string) =>
    apiClient.get<ApiResource<Booking>>(`/bookings/${bookingCode}`)
      .then((response) => ({ ...response, data: unwrapResource(response.data) })),

  create: (data: CreateBookingData) =>
    apiClient.post<ApiResource<Booking>>('/bookings', data)
      .then((response) => ({ ...response, data: unwrapResource(response.data) })),

  cancel: (bookingCode: string) => apiClient.delete(`/bookings/${bookingCode}`),
};
