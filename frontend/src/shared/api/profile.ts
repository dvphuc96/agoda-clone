import apiClient from './client';
import type { User } from './auth';

export interface UpdateProfileData {
  name: string;
  phone?: string | null;
}

export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const profileApi = {
  get: () => apiClient.get<{ data: User }>('/profile'),

  update: (data: UpdateProfileData) =>
    apiClient.put<{ data: User }>('/profile', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post<{ avatar_url: string }>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  changePassword: (data: ChangePasswordData) =>
    apiClient.put<{ message: string }>('/profile/password', data),
};
