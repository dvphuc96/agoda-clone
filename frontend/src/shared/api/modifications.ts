import apiClient from './client';
import type { Booking } from './bookings';

export interface BookingModification {
  id: number;
  booking_id: number;
  old_check_in: string;
  old_check_out: string;
  old_guests: number;
  old_total_price: string;
  new_check_in: string;
  new_check_out: string;
  new_guests: number;
  new_total_price: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  price_diff: number;
  old_nights: number;
  new_nights: number;
  user?: { id: number; name: string; email: string };
  booking?: Booking;
  created_at: string;
}

export interface RequestModificationData {
  new_check_in: string;
  new_check_out: string;
  new_guests: number;
}

type ApiResource<T> = T | { data: T };

function unwrapResource<T>(payload: ApiResource<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

export const modificationsApi = {
  requestModification: (bookingCode: string, data: RequestModificationData) =>
    apiClient.post<ApiResource<BookingModification>>(`/bookings/${bookingCode}/modify`, data)
      .then((response) => ({ ...response, data: unwrapResource(response.data) })),

  listForBooking: (bookingCode: string) =>
    apiClient.get<ApiResource<BookingModification[]>>(`/bookings/${bookingCode}/modifications`)
      .then((response) => ({ ...response, data: unwrapResource(response.data) })),
};
