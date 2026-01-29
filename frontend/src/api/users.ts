import apiClient from './axios';
import type { UserData } from '@/types/configure';

export interface CreateUserData {
    email: string;
    name: string;
    role: string;
    password?: string;
}

export interface UpdateUserData {
    email?: string;
    name?: string;
    role?: string;
    status?: 'active' | 'inactive';
}

export interface UsersResponse {
    users: UserData[];
    total: number;
    page: number;
    limit: number;
}

export const usersAPI = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; role?: string }): Promise<UsersResponse> => {
        const response = await apiClient.get<UsersResponse>('/api/v1/users', { params });
        return response.data;
    },

    getById: async (id: string): Promise<UserData> => {
        const response = await apiClient.get<UserData>(`/api/v1/users/${id}`);
        return response.data;
    },

    create: async (data: CreateUserData): Promise<UserData> => {
        const response = await apiClient.post<UserData>('/api/v1/users', data);
        return response.data;
    },

    update: async (id: string, data: UpdateUserData): Promise<UserData> => {
        const response = await apiClient.put<UserData>(`/api/v1/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/v1/users/${id}`);
    },
};
