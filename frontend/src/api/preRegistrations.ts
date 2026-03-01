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
    getById: async (id: string) => {
        const { data } = await api.get<VendorPreRegistration>(`/api/v1/pre-registrations/${id}`);
        return data;
    },
    assignQuestionnaires: async (id: string, assignData: VendorQuestionnaireAssignCreate) => {
        const { data } = await api.post<VendorQuestionnaireAssignment[]>(`/api/v1/pre-registrations/${id}/questionnaires/assign`, assignData);
        return data;
    },
    getAssignedQuestionnaires: async (id: string) => {
        const { data } = await api.get<VendorQuestionnaireAssignment[]>(`/api/v1/pre-registrations/${id}/questionnaires`);
        return data;
    },
};
