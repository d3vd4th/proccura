import api from './axios';

export interface VendorQuestionnaireAssignment {
    id: string;
    tenant_id: string;
    pre_registration_id: string;
    questionnaire_id: string;
    status: string;
    assigned_at: string;
    completed_at?: string;
}

export interface VendorQuestionnaireAssignCreate {
    questionnaire_ids: string[];
}

export interface VendorRegistration {
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

export interface PaginatedVendorRegistrations {
    items: VendorRegistration[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export const vendorRegistrationsAPI = {
    list: async (params: { page?: number; limit?: number; search?: string } = {}) => {
        const { data } = await api.get<PaginatedVendorRegistrations>('/api/v1/vendor-registrations', {
            params,
        });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get<VendorRegistration>(`/api/v1/vendor-registrations/${id}`);
        return data;
    },
    assignQuestionnaires: async (id: string, assignData: VendorQuestionnaireAssignCreate) => {
        const { data } = await api.post<VendorQuestionnaireAssignment[]>(`/api/v1/vendor-registrations/${id}/questionnaires/assign`, assignData);
        return data;
    },
    getAssignedQuestionnaires: async (id: string) => {
        const { data } = await api.get<VendorQuestionnaireAssignment[]>(`/api/v1/vendor-registrations/${id}/questionnaires`);
        return data;
    },
};
