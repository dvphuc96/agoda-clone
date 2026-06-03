import apiClient from './client';

export interface TicketMessage {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name: string;
  is_admin: boolean;
  message: string;
  created_at: string;
}

export interface SupportTicket {
  id: number;
  user_id: number;
  user?: { id: number; name: string; email: string };
  booking_code: string | null;
  subject: string;
  category: string;
  status: string;
  priority: string;
  messages?: TicketMessage[];
  messages_count?: number;
  created_at: string;
  updated_at: string;
}

export const supportApi = {
  list: () => apiClient.get<{ data: SupportTicket[]; current_page: number; last_page: number; total: number }>('/support/tickets'),
  create: (data: { subject: string; category: string; booking_code?: string; message: string }) => apiClient.post('/support/tickets', data),
  get: (id: number) => apiClient.get<{ data: SupportTicket }>(`/support/tickets/${id}`),
  reply: (id: number, message: string) => apiClient.post(`/support/tickets/${id}/messages`, { message }),
};
