import api from './axios';

export interface Vendor {
    id: string;
    tenant_id: string;
    registration_id?: string;
    business_name: string;
    contact_person: string;
    contact_person_email?: string;
    email: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    gst_number?: string;
    pan_number?: string;
    business_type?: string;
    products_services?: string;
    status: string;
    created_at: string;
}

export interface PaginatedVendors {
    items: Vendor[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export const vendorsAPI = {
    list: async (params: { page?: number; limit?: number; search?: string } = {}) => {
        const { data } = await api.get<PaginatedVendors>('/api/v1/vendors', { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get<Vendor>(`/api/v1/vendors/${id}`);
        return data;
    }
};
