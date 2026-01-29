import apiClient from './axios';
import type { TenantData } from '@/types/configure';

export interface CreateTenantData {
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

export interface UpdateTenantData {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    status?: 'active' | 'inactive';
}

export interface TenantsResponse {
    tenants: TenantData[];
    total: number;
    page: number;
    limit: number;
}

export const tenantsAPI = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<TenantsResponse> => {
        const response = await apiClient.get<TenantsResponse>('/api/v1/tenants/list', { params });
        return response.data;
    },

    getById: async (id: string): Promise<TenantData> => {
        const response = await apiClient.get<TenantData>(`/api/v1/tenants/${id}`);
        return response.data;
    },

    create: async (data: CreateTenantData): Promise<TenantData> => {
        const response = await apiClient.post<TenantData>('/api/v1/tenants', data);
        return response.data;
    },

    update: async (id: string, data: UpdateTenantData): Promise<TenantData> => {
        const response = await apiClient.put<TenantData>(`/api/v1/tenants/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/v1/tenants/${id}`);
    },
};
