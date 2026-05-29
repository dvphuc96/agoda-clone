import apiClient from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: 'user' | 'admin';
  is_active?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  logout: () => apiClient.post('/auth/logout'),

  me: () => apiClient.get<User>('/auth/me'),
};
