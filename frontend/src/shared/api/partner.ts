import apiClient from './client';
import type { Hotel, RoomType, Booking } from './hotels';
import type { Paginated } from './admin';
import type { PriceOverride, PriceOverridePayload } from './price-overrides';

export interface PartnerStats {
  total_revenue: number;
  total_bookings: number;
  active_hotels: number;
  avg_rating: number;
}

export const partnerApi = {
  stats: () => apiClient.get<PartnerStats>('/partner/dashboard/stats'),

  hotels: () => apiClient.get<Hotel[]>('/partner/hotels'),
  hotel: (id: number) => apiClient.get<Hotel>(`/partner/hotels/${id}`),
  createHotel: (data: Partial<Hotel>) => apiClient.post<Hotel>('/partner/hotels', data),
  updateHotel: (id: number, data: Partial<Hotel>) => apiClient.put<Hotel>(`/partner/hotels/${id}`, data),

  roomTypes: (hotelId: number) => apiClient.get<RoomType[]>(`/partner/hotels/${hotelId}/room-types`),
  createRoomType: (hotelId: number, data: Record<string, unknown>) => apiClient.post(`/partner/hotels/${hotelId}/room-types`, data),
  roomType: (id: number) => apiClient.get<RoomType>(`/partner/room-types/${id}`),
  updateRoomType: (id: number, data: Record<string, unknown>) => apiClient.put(`/partner/room-types/${id}`, data),

  bookings: (params?: Record<string, string | number>) => apiClient.get<Paginated<Booking>>('/partner/bookings', { params }),
  booking: (id: number) => apiClient.get<Booking>(`/partner/bookings/${id}`),
  updateBookingStatus: (id: number, status: string) => apiClient.patch(`/partner/bookings/${id}/status`, { status }),

  priceOverrides: (roomTypeId: number) => apiClient.get<PriceOverride[]>(`/partner/room-types/${roomTypeId}/price-overrides`),
  createPriceOverride: (roomTypeId: number, data: PriceOverridePayload) => apiClient.post(`/partner/room-types/${roomTypeId}/price-overrides`, data),
  updatePriceOverride: (id: number, data: PriceOverridePayload) => apiClient.put(`/partner/price-overrides/${id}`, data),
  togglePriceOverride: (id: number) => apiClient.patch(`/partner/price-overrides/${id}/toggle-active`),
};
