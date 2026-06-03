import apiClient from './client';
import type { Booking, Payment } from './bookings';
import type { Hotel, Location, RoomType } from './hotels';
import type { User } from './auth';
import type { Refund } from './refunds';
import type { BookingPolicy, BookingPolicyPayload } from './policies';
import type { TransferBooking, TransferRoute, TransferStatus, TransferVehicleType } from './transfers';
import type { Coupon, CouponPayload } from './coupons';
import type { Review } from './reviews';
import type { BookingModification } from './modifications';

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
export type HotelPayload = Omit<Partial<Hotel>, 'id' | 'location' | 'images' | 'room_types' | 'min_price' | 'max_price'> & {
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
export type TransferVehicleTypePayload = Omit<Partial<TransferVehicleType>, 'id' | 'created_at'> & {
  name: string;
  passenger_capacity: number;
  luggage_capacity: number;
  is_active: boolean;
};
export type TransferRoutePayload = {
  hotel_id: number;
  transfer_vehicle_type_id: number;
  airport_code: string;
  airport_name: string;
  pickup_latitude?: string | number | null;
  pickup_longitude?: string | number | null;
  direction: TransferRoute['direction'];
  price: string | number;
  currency: string;
  duration_minutes?: number | null;
  distance_meters?: number | null;
  duration_seconds?: number | null;
  base_fee: string | number;
  price_per_km: string | number;
  price_override?: string | number | null;
  pricing_source?: TransferRoute['pricing_source'];
  is_active: boolean;
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
  deleteRoomTypeImage: (imageId: number) => apiClient.delete(`/admin/room-types/images/${imageId}`),

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

  refunds: (params?: Record<string, string | number>) => apiClient.get<Paginated<Refund>>('/admin/refunds', { params }),
  refund: (id: number) => apiClient.get<Refund>(`/admin/refunds/${id}`),
  updateRefundStatus: (id: number, status: Refund['status']) => apiClient.patch<Refund>(`/admin/refunds/${id}/status`, { status }),

  bookingPolicies: (params?: Record<string, string | number>) => apiClient.get<Paginated<BookingPolicy>>('/admin/booking-policies', { params }),
  bookingPolicy: (id: number) => apiClient.get<BookingPolicy>(`/admin/booking-policies/${id}`),
  createBookingPolicy: (data: BookingPolicyPayload) => apiClient.post<BookingPolicy>('/admin/booking-policies', data),
  updateBookingPolicy: (id: number, data: BookingPolicyPayload) => apiClient.put<BookingPolicy>(`/admin/booking-policies/${id}`, data),
  deleteBookingPolicy: (id: number) => apiClient.delete(`/admin/booking-policies/${id}`),

  transferVehicleTypes: (params?: Record<string, string | number>) => apiClient.get<Paginated<TransferVehicleType>>('/admin/transfer-vehicle-types', { params }),
  createTransferVehicleType: (data: TransferVehicleTypePayload) => apiClient.post<TransferVehicleType>('/admin/transfer-vehicle-types', data),
  updateTransferVehicleType: (id: number, data: TransferVehicleTypePayload) => apiClient.put<TransferVehicleType>(`/admin/transfer-vehicle-types/${id}`, data),
  deleteTransferVehicleType: (id: number) => apiClient.delete(`/admin/transfer-vehicle-types/${id}`),

  transferRoutes: (params?: Record<string, string | number>) => apiClient.get<Paginated<TransferRoute>>('/admin/transfer-routes', { params }),
  createTransferRoute: (data: TransferRoutePayload) => apiClient.post<TransferRoute>('/admin/transfer-routes', data),
  updateTransferRoute: (id: number, data: TransferRoutePayload) => apiClient.put<TransferRoute>(`/admin/transfer-routes/${id}`, data),
  deleteTransferRoute: (id: number) => apiClient.delete(`/admin/transfer-routes/${id}`),
  refreshTransferRouteDistance: (id: number) => apiClient.post<TransferRoute>(`/admin/transfer-routes/${id}/refresh-distance`),

  transferBookings: (params?: Record<string, string | number>) => apiClient.get<Paginated<TransferBooking>>('/admin/transfer-bookings', { params }),
  transferBooking: (id: number) => apiClient.get<TransferBooking>(`/admin/transfer-bookings/${id}`),
  updateTransferBookingStatus: (id: number, status: TransferStatus) => apiClient.patch<TransferBooking>(`/admin/transfer-bookings/${id}/status`, { status }),

  modifications: (params?: Record<string, string | number>) => apiClient.get<Paginated<BookingModification>>('/admin/modifications', { params }),
  modification: (id: number) => apiClient.get<BookingModification>(`/admin/modifications/${id}`),
  approveModification: (id: number, adminNotes?: string) => apiClient.patch<BookingModification>(`/admin/modifications/${id}/approve`, { admin_notes: adminNotes }),
  rejectModification: (id: number, adminNotes?: string) => apiClient.patch<BookingModification>(`/admin/modifications/${id}/reject`, { admin_notes: adminNotes }),

  coupons: (params?: Record<string, string | number>) => apiClient.get<Paginated<Coupon>>('/admin/coupons', { params }),
  coupon: (id: number) => apiClient.get<{ data: Coupon }>(`/admin/coupons/${id}`),
  createCoupon: (data: CouponPayload) => apiClient.post<{ data: Coupon; message: string }>('/admin/coupons', data),
  updateCoupon: (id: number, data: CouponPayload) => apiClient.put<{ data: Coupon; message: string }>(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: number) => apiClient.delete<{ message: string }>(`/admin/coupons/${id}`),
  toggleCouponActive: (id: number) => apiClient.patch<{ data: Coupon; message: string }>(`/admin/coupons/${id}/toggle-active`),

  reviews: (params?: Record<string, string | number>) => apiClient.get<Paginated<Review>>('/admin/reviews', { params }),
  review: (id: number) => apiClient.get<Review>(`/admin/reviews/${id}`),
  updateReviewStatus: (id: number, status: string) => apiClient.patch<Review>(`/admin/reviews/${id}/status`, { status }),
  deleteReview: (id: number) => apiClient.delete(`/admin/reviews/${id}`),
};
