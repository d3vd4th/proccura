import apiClient from './axios';
import type { RoleData } from '@/types/configure';

export interface CreateRoleData {
    name: string;
    description: string;
    permissions?: string[];
}

export interface UpdateRoleData {
    name?: string;
    description?: string;
    permissions?: string[];
}

export const rolesAPI = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<RoleData[]> => {
        const response = await apiClient.get<RoleData[]>('/api/v1/roles', { params });
        return response.data;
    },

    getById: async (id: string): Promise<RoleData> => {
        const response = await apiClient.get<RoleData>(`/api/v1/roles/${id}`);
        return response.data;
    },

    create: async (data: CreateRoleData): Promise<RoleData> => {
        const response = await apiClient.post<RoleData>('/api/v1/roles', data);
        return response.data;
    },

    update: async (id: string, data: UpdateRoleData): Promise<RoleData> => {
        const response = await apiClient.put<RoleData>(`/api/v1/roles/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/v1/roles/${id}`);
    },

    getPermissions: async (): Promise<string[]> => {
        const response = await apiClient.get<string[]>('/api/v1/roles/permissions');
        return response.data;
    },
};
