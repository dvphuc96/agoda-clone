import apiClient from './client';
import type { Hotel, RoomType } from './hotels';
import type { Booking } from './bookings';
import type { Paginated } from './admin';
import type { PriceOverride, PriceOverridePayload } from './price-overrides';

export interface PartnerStats {
  total_revenue: number;
  total_bookings: number;
  active_hotels: number;
  avg_rating: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  bookings: number;
}

export interface OccupancyData {
  date: string;
  total_rooms: number;
  booked_rooms: number;
  rate: number;
}

export interface TopRoomType {
  room_type: { id: number; name: string };
  revenue: number;
  bookings: number;
  occupancy_rate: number;
}

export interface ReviewsSummary {
  avg_rating: number;
  total_reviews: number;
  response_rate: number;
  rating_trend: { date: string; avg_rating: number }[];
}

export const partnerApi = {
  stats: () => apiClient.get<PartnerStats>('/partner/dashboard/stats'),

  revenueChart: (params?: { period?: string; start_date?: string; end_date?: string }) =>
    apiClient.get<{ data: RevenueChartData[] }>('/partner/dashboard/revenue-chart', { params }),
  occupancy: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get<{ data: OccupancyData[] }>('/partner/dashboard/occupancy', { params }),
  topRoomTypes: (params?: { limit?: number }) =>
    apiClient.get<{ data: TopRoomType[] }>('/partner/dashboard/top-room-types', { params }),
  reviewsSummary: () =>
    apiClient.get<{ data: ReviewsSummary }>('/partner/dashboard/reviews-summary'),

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
