import apiClient from './client';

export interface Refund {
  id: number;
  booking_id: number;
  payment_id: number;
  amount: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  processed_by?: number | null;
  admin_notes?: string | null;
  processed_at: string | null;
  created_at: string;
  booking?: {
    id: number;
    booking_code: string;
    status: string;
    total_price: string;
    room_type?: { name: string; hotel?: { name: string } };
  };
  payment?: {
    id: number;
    payment_method: string;
    amount: string;
    status: string;
  };
  requester?: {
    id: number;
    name: string;
    email: string;
  };
  processor?: {
    id: number;
    name: string;
  };
}

export interface CancelRequestData {
  reason: string;
}

export const refundsApi = {
  requestCancel: (bookingCode: string, data: CancelRequestData) =>
    apiClient.post<{ message: string; refund?: Refund }>(`/bookings/${bookingCode}/cancel-request`, data),
};
