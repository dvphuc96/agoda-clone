import apiClient from './client';
import type { Booking, Payment } from './bookings';
import type { Hotel, Location, RoomType } from './hotels';
import type { User } from './auth';

export interface Paginated<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  total?: number;
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface DashboardStats {
  bookings: { today: number; week: number; month: number };
  revenue: { today: number; week: number; month: number };
  active_hotels: number;
  new_users: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface StatusPoint {
  status: string;
  count: number;
}

export type AdminUser = User & {
  is_active: boolean;
  bookings_count?: number;
  created_at?: string;
  bookings?: Booking[];
};

export type LocationPayload = Pick<Location, 'name' | 'slug' | 'image' | 'description' | 'region'>;
export type HotelPayload = Omit<Partial<Hotel>, 'id' | 'location' | 'images' | 'room_types' | 'min_price'> & {
  location_id: number;
  name: string;
  address: string;
  star_rating: number;
  checkin_time: string;
  checkout_time: string;
  status: 'active' | 'inactive';
};
export type RoomTypePayload = Omit<Partial<RoomType>, 'id' | 'images' | 'available_rooms'> & {
  name: string;
  max_guests: number;
  bed_type: string;
  price_per_night: string | number;
  total_rooms: number;
};

const formDataWithFiles = (name: string, files: FileList | File[]) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append(name, file));
  return formData;
};

export const adminApi = {
  stats: () => apiClient.get<DashboardStats>('/admin/dashboard/stats'),
  revenueChart: () => apiClient.get<{ data: RevenuePoint[] }>('/admin/dashboard/revenue-chart'),
  bookingStatus: () => apiClient.get<{ data: StatusPoint[] }>('/admin/dashboard/booking-status'),

  locations: (params?: Record<string, string | number>) => apiClient.get<Paginated<Location>>('/admin/locations', { params }),
  createLocation: (data: LocationPayload) => apiClient.post<Location>('/admin/locations', data),
  updateLocation: (id: number, data: LocationPayload) => apiClient.put<Location>(`/admin/locations/${id}`, data),
  deleteLocation: (id: number) => apiClient.delete(`/admin/locations/${id}`),
  uploadLocationImage: (id: number, image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    return apiClient.post<Location>(`/admin/locations/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  hotels: (params?: Record<string, string | number>) => apiClient.get<Paginated<Hotel>>('/admin/hotels', { params }),
  createHotel: (data: HotelPayload) => apiClient.post<Hotel>('/admin/hotels', data),
  updateHotel: (id: number, data: HotelPayload) => apiClient.put<Hotel>(`/admin/hotels/${id}`, data),
  deleteHotel: (id: number) => apiClient.delete(`/admin/hotels/${id}`),
  toggleHotelStatus: (id: number) => apiClient.patch<Hotel>(`/admin/hotels/${id}/toggle-status`),
  uploadHotelImages: (id: number, files: FileList | File[]) =>
    apiClient.post<Hotel>(`/admin/hotels/${id}/images`, formDataWithFiles('images[]', files), { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteHotelImage: (id: number) => apiClient.delete(`/admin/hotels/images/${id}`),

  roomTypes: (hotelId: number) => apiClient.get<Paginated<RoomType>>(`/admin/hotels/${hotelId}/room-types`),
  createRoomType: (hotelId: number, data: RoomTypePayload) => apiClient.post<RoomType>(`/admin/hotels/${hotelId}/room-types`, data),
  updateRoomType: (id: number, data: RoomTypePayload) => apiClient.put<RoomType>(`/admin/room-types/${id}`, data),
  deleteRoomType: (id: number) => apiClient.delete(`/admin/room-types/${id}`),
  uploadRoomTypeImages: (id: number, files: FileList | File[]) =>
    apiClient.post<RoomType>(`/admin/room-types/${id}/images`, formDataWithFiles('images[]', files), { headers: { 'Content-Type': 'multipart/form-data' } }),

  bookings: (params?: Record<string, string | number>) => apiClient.get<Paginated<Booking>>('/admin/bookings', { params }),
  booking: (id: number) => apiClient.get<Booking>(`/admin/bookings/${id}`),
  updateBookingStatus: (id: number, status: Booking['status']) => apiClient.patch<Booking>(`/admin/bookings/${id}/status`, { status }),
  exportBookings: () => apiClient.get<Blob>('/admin/bookings/export', { responseType: 'blob' }),

  payments: (params?: Record<string, string | number>) => apiClient.get<Paginated<Payment>>('/admin/payments', { params }),
  payment: (id: number) => apiClient.get<Payment>(`/admin/payments/${id}`),

  users: (params?: Record<string, string | number>) => apiClient.get<Paginated<AdminUser>>('/admin/users', { params }),
  user: (id: number) => apiClient.get<AdminUser>(`/admin/users/${id}`),
  updateUserRole: (id: number, role: 'user' | 'admin') => apiClient.patch<AdminUser>(`/admin/users/${id}/role`, { role }),
  toggleUserActive: (id: number) => apiClient.patch<AdminUser>(`/admin/users/${id}/toggle-active`),
};
