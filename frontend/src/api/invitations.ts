import apiClient from './axios';

export interface InvitationData {
    id: string;
    email: string;
    business_name: string;
    status: 'PENDING' | 'PRE_REGISTERED' | 'EXPIRED';
    created_at: string;
}

export interface CreateInvitationData {
    email: string;
    business_name: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export const invitationsAPI = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<PaginatedResponse<InvitationData>> => {
        const response = await apiClient.get<PaginatedResponse<InvitationData>>('/api/v1/invitations', { params });
        return response.data;
    },

    getById: async (id: string): Promise<InvitationData> => {
        const response = await apiClient.get<InvitationData>(`/api/v1/invitations/${id}`);
        return response.data;
    },

    create: async (data: CreateInvitationData): Promise<InvitationData> => {
        const response = await apiClient.post<InvitationData>('/api/v1/invitations', data);
        return response.data;
    },

    resend: async (id: string): Promise<InvitationData> => {
        const response = await apiClient.post<InvitationData>(`/api/v1/invitations/${id}/resend`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/v1/invitations/${id}`);
    },
};
