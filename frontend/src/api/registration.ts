import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Separate axios instance without auth headers for public endpoints
const publicClient = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

export interface InvitationVerify {
    business_name: string;
    email: string;
    status: string;
}

export interface PreRegistrationData {
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
}

export interface PreRegistrationResponse {
    id: string;
    invitation_id: string;
    business_name: string;
    contact_person: string;
    contact_person_email?: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    business_type?: string;
    status: string;
    created_at: string;
}

export const registrationAPI = {
    verify: async (token: string): Promise<InvitationVerify> => {
        const response = await publicClient.get<InvitationVerify>(`/api/v1/register/verify/${token}`);
        return response.data;
    },

    submit: async (token: string, data: PreRegistrationData): Promise<PreRegistrationResponse> => {
        const response = await publicClient.post<PreRegistrationResponse>(`/api/v1/register/${token}`, data);
        return response.data;
    },
};
