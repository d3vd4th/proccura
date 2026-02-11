import api from './axios';

export interface VendorPreRegistration {
    id: string;
    invitation_id: string;
    business_name: string;
    contact_person: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    business_type?: string;
    created_at: string;
}

export interface PaginatedPreRegistrations {
    items: VendorPreRegistration[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export const preRegistrationsAPI = {
    list: async (params: { page?: number; limit?: number; search?: string } = {}) => {
        const { data } = await api.get<PaginatedPreRegistrations>('/api/v1/pre-registrations', {
            params,
        });
        return data;
    },
};
