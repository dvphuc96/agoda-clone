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
  read_at: string | null;
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = {
  list: () => apiClient.get<{ data: Notification[] }>('/notifications'),
  getUnreadCount: () => apiClient.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: number) => apiClient.post<{ data: Notification }>(`/notifications/${id}/read`),
  markAllRead: () => apiClient.post<{ message: string }>('/notifications/mark-all-read'),
  delete: (id: number) => apiClient.delete<void>(`/notifications/${id}`),
};
