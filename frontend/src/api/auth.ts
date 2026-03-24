import apiClient from './axios';
import type { RegisterData, AuthResponse, User } from '@/types/auth';

export interface TenantInfo {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface CheckEmailResponse {
  user_exists: boolean;
  is_super_admin: boolean;
  tenants: TenantInfo[];
  requires_password_reset: boolean;
}

export const authAPI = {
  checkEmail: async (email: string): Promise<CheckEmailResponse> => {
    const response = await apiClient.post<CheckEmailResponse>('/api/v1/auth/check-email', { email });
    return response.data;
  },
  login: async (email: string, password: string, tenant_id?: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', { email, password, tenant_id });
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
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/request-password-reset', { email });
  },
  resetPassword: async (token: string, new_password: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/reset-password', { token, new_password });
  },
};

