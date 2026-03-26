import api from './axios';

export interface VendorQuestionnaireAssignment {
    id: string;
    tenant_id: string;
    pre_registration_id: string;
    questionnaire_id: string;
    status: string;
    response?: string;
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
    approver_id?: string;
    created_at: string;
}

export interface PaginatedVendorRegistrations {
    items: VendorRegistration[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface VendorUser {
    id: string;
    registration_id: string;
    auth_user_id: string;
    email: string;
    first_name: string;
    last_name?: string;
    is_primary: boolean;
    created_at: string;
}

export interface VendorUserCreate {
    email: string;
    first_name: string;
    last_name?: string;
    is_primary?: boolean;
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

    // Approval Flow
    assignApprover: async (id: string, approver_id: string) => {
        const { data } = await api.patch<VendorRegistration>(`/api/v1/vendor-registrations/${id}/approver`, { approver_id });
        return data;
    },
    approveAssignment: async (id: string, assignment_id: string) => {
        const { data } = await api.post<VendorQuestionnaireAssignment>(`/api/v1/vendor-registrations/${id}/questionnaires/${assignment_id}/approve`);
        return data;
    },
    rejectAssignment: async (id: string, assignment_id: string) => {
        const { data } = await api.post<VendorQuestionnaireAssignment>(`/api/v1/vendor-registrations/${id}/questionnaires/${assignment_id}/reject`);
        return data;
    },
    convertVendor: async (id: string) => {
        const { data } = await api.patch<any>(`/api/v1/vendor-registrations/${id}/vendor`);
        return data;
    },

    // Vendor Users
    provisionUser: async (id: string, userData: VendorUserCreate) => {
        const { data } = await api.post<VendorUser>(`/api/v1/vendor-registrations/${id}/users`, userData);
        return data;
    },
    listUsers: async (id: string) => {
        const { data } = await api.get<VendorUser[]>(`/api/v1/vendor-registrations/${id}/users`);
        return data;
    },
    deleteUser: async (registrationId: string, userId: string) => {
        await api.delete(`/api/v1/vendor-registrations/${registrationId}/users/${userId}`);
    },
};
