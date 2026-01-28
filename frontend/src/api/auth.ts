import apiClient from './axios';
import type { RegisterData, AuthResponse, User } from '@/types/auth';

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', userData);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
  },
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>('/api/v1/auth/me');
      console.log('✅ getCurrentUser API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ getCurrentUser API error:', error.response?.status, error.message);
      throw error;
    }
  },
};
