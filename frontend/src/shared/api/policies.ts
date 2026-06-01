import apiClient from './client';

export interface BookingPolicy {
  id: number;
  name: string;
  description: string | null;
  hotel_id: number | null;
  room_type_id: number | null;
  free_cancellation_hours: number;
  cancellation_fee_percent: number;
  is_non_refundable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  hotel?: { id: number; name: string };
  room_type?: { id: number; name: string };
}

export interface BookingPolicyPayload {
  name: string;
  description?: string | null;
  hotel_id: number | null;
  room_type_id?: number | null;
  free_cancellation_hours: number;
  cancellation_fee_percent: number;
  is_non_refundable?: boolean;
  is_active?: boolean;
}

export interface CancellationPolicySummary {
  can_cancel: boolean;
  is_free: boolean | null;
  fee_amount: number | string | null;
  refund_amount: number | string | null;
  reason: string | null;
  policy: {
    name: string;
    free_cancellation_hours: number;
    cancellation_fee_percent: number;
    is_non_refundable: boolean;
  } | null;
}

export const policiesApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<{ data: BookingPolicy[] }>('/admin/booking-policies', { params }),
  get: (id: number) => apiClient.get<BookingPolicy>(`/admin/booking-policies/${id}`),
  create: (data: BookingPolicyPayload) => apiClient.post<BookingPolicy>('/admin/booking-policies', data),
  update: (id: number, data: BookingPolicyPayload) => apiClient.put<BookingPolicy>(`/admin/booking-policies/${id}`, data),
  delete: (id: number) => apiClient.delete(`/admin/booking-policies/${id}`),
};
