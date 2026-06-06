import apiClient from './client';

export interface PriceAlert {
  id: number;
  hotel_id: number;
  target_price: number;
  is_active: boolean;
  last_notified_at: string | null;
  hotel: {
    id: number;
    name: string;
    slug: string;
    star_rating: number;
    thumbnail: string | null;
    address: string;
  };
  created_at: string;
}

export const priceAlertsApi = {
  list: () => apiClient.get<{ data: PriceAlert[] }>('/price-alerts'),
  create: (hotelId: number, targetPrice: number) =>
    apiClient.post('/price-alerts', { hotel_id: hotelId, target_price: targetPrice }),
  delete: (id: number) => apiClient.delete(`/price-alerts/${id}`),
  toggle: (id: number) => apiClient.put(`/price-alerts/${id}`),
};
