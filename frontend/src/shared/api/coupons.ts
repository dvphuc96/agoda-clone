import apiClient from './client';

export interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_booking_value: number | null;
  max_uses: number | null;
  used_count: number;
  remaining_uses: number | null;
  max_uses_per_user: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  applicable_hotels: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface ValidateCouponResponse {
  coupon: Coupon;
  discount_amount: number;
  final_price: number;
}

export interface ValidateCouponResponseData {
  data: ValidateCouponResponse;
  message: string;
}

export interface ValidateCouponError {
  message?: string;
}

export type CouponPayload = Partial<Omit<Coupon, 'id' | 'used_count' | 'remaining_uses' | 'created_at' | 'updated_at'>>;

export const couponsApi = {
  validate: (data: { code: string; booking_value: number; hotel_id?: number }) =>
    apiClient.post<ValidateCouponResponseData>('/coupons/validate', data),
};

export const adminCouponsApi = {
  index: (params?: { page?: number; per_page?: number; is_active?: boolean; search?: string }) =>
    apiClient.get('/admin/coupons', { params }),
  show: (id: number) => apiClient.get<{ data: Coupon }>(`/admin/coupons/${id}`),
  store: (data: Partial<Coupon>) => apiClient.post<{ data: Coupon; message: string }>('/admin/coupons', data),
  update: (id: number, data: Partial<Coupon>) => apiClient.put<{ data: Coupon; message: string }>(`/admin/coupons/${id}`, data),
  destroy: (id: number) => apiClient.delete<{ message: string }>(`/admin/coupons/${id}`),
  toggleActive: (id: number) => apiClient.patch<{ data: Coupon; message: string }>(`/admin/coupons/${id}/toggle-active`),
};