import apiClient from './client';

export interface Notification {
  id: number;
  booking_id: number | null;
  type: string;
  channel: string;
  status: string;
  payload: Record<string, unknown> | null;
  message: string | null;
  booking: {
    id: number;
    booking_code: string;
  } | null;
  sent_at: string | null;
  created_at: string;
}

export const notificationsApi = {
  list: () => apiClient.get<{ data: Notification[] }>('/notifications'),
};
