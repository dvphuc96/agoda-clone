import apiClient from './client';
import type { Hotel, RoomType } from './hotels';

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
  room_type: RoomType & { hotel: Hotel };
  payments: Payment[];
  created_at: string;
}

export interface CreateBookingData {
  room_type_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  special_requests?: string;
}

export const bookingsApi = {
  list: () => apiClient.get<{ data: Booking[] }>('/bookings'),

  get: (bookingCode: string) => apiClient.get<Booking>(`/bookings/${bookingCode}`),

  create: (data: CreateBookingData) => apiClient.post<Booking>('/bookings', data),

  cancel: (bookingCode: string) => apiClient.delete(`/bookings/${bookingCode}`),
};
