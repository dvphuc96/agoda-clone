import apiClient from './client';

export interface Review {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  status: 'pending' | 'approved' | 'rejected';
  user?: { name: string; avatar?: string | null };
  hotel_name?: string;
  created_at: string;
}

export interface ReviewPayload {
  rating: number;
  title?: string;
  comment?: string;
  hotel_id: number;
  booking_id?: number;
}

export const reviewsApi = {
  list: (hotelSlug: string, params?: Record<string, string | number>) =>
    apiClient.get(`/hotels/${hotelSlug}/reviews`, { params }),

  create: (data: ReviewPayload) =>
    apiClient.post('/reviews', data),

  update: (id: number, data: Partial<ReviewPayload>) =>
    apiClient.put(`/reviews/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/reviews/${id}`),
};
