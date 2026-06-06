import apiClient from './client';

export interface OwnerResponse {
  text: string;
  responded_at: string;
}

export interface Review {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  user?: { name: string; avatar?: string | null };
  hotel_name?: string;
  owner_response?: OwnerResponse | null;
  created_at: string;
}

export interface ReviewPayload {
  rating: number;
  title?: string;
  comment?: string;
  hotel_id: number;
  booking_id?: number;
  images?: File[];
}

export const reviewsApi = {
  list: (hotelSlug: string, params?: Record<string, string | number>) =>
    apiClient.get(`/hotels/${hotelSlug}/reviews`, { params }),

  create: (data: ReviewPayload) => {
    if (data.images?.length) {
      const formData = new FormData();
      formData.append('rating', String(data.rating));
      formData.append('hotel_id', String(data.hotel_id));
      if (data.title) formData.append('title', data.title);
      if (data.comment) formData.append('comment', data.comment);
      if (data.booking_id) formData.append('booking_id', String(data.booking_id));
      data.images.forEach(img => formData.append('images[]', img));
      return apiClient.post('/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.post('/reviews', data);
  },

  update: (id: number, data: Partial<ReviewPayload> & { images?: File[] }) => {
    if (data.images?.length) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      if (data.rating) formData.append('rating', String(data.rating));
      if (data.title) formData.append('title', data.title);
      if (data.comment) formData.append('comment', data.comment);
      data.images.forEach(img => formData.append('images[]', img));
      return apiClient.post(`/reviews/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.put(`/reviews/${id}`, data);
  },

  delete: (id: number) =>
    apiClient.delete(`/reviews/${id}`),

  respond: (reviewId: number, response: string) =>
    apiClient.post(`/partner/reviews/${reviewId}/respond`, { response }),
};
