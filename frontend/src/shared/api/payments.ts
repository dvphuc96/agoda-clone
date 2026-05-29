import apiClient from './client';
import type { Payment } from './bookings';

export const paymentsApi = {
  create: (bookingId: number, paymentMethod: 'vnpay' | 'momo') =>
    apiClient.post<{ payment_id: number; payment_url: string }>('/payments/create', {
      booking_id: bookingId,
      payment_method: paymentMethod,
    }),

  get: (id: number) => apiClient.get<Payment>(`/payments/${id}`),
};
