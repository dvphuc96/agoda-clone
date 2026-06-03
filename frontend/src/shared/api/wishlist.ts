import apiClient from './client';

export interface WishlistToggleResponse {
  is_wishlisted: boolean;
}

export const wishlistApi = {
  list: () => apiClient.get<{ data: unknown[] }>('/wishlists'),

  toggle: (hotelId: number) =>
    apiClient.post<WishlistToggleResponse>('/wishlists/toggle', { hotel_id: hotelId }),

  remove: (hotelId: number) =>
    apiClient.delete<WishlistToggleResponse>(`/wishlists/${hotelId}`),

  check: (hotelId: number) =>
    apiClient.get<{ is_wishlisted: boolean }>(`/wishlists/check/${hotelId}`),
};
