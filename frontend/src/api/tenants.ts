import apiClient from './axios';
import type { TenantData } from '@/types/configure';

export interface CreateTenantData {
    name: string;
    email: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
}

export interface UpdateTenantData {
    name?: string;
    email?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    status?: 'active' | 'inactive';
}

export const tenantsAPI = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<TenantData[]> => {
        const response = await apiClient.get<TenantData[]>('/api/v1/tenants/list', { params });
        return response.data;
    },

    getById: async (id: string): Promise<TenantData> => {
        const response = await apiClient.get<TenantData>(`/api/v1/tenants/${id}`);
        return response.data;
    },

    create: async (data: CreateTenantData): Promise<TenantData> => {
        const response = await apiClient.post<TenantData>('/api/v1/tenants/create', data);
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
