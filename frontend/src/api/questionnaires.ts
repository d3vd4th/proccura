import apiClient from './axios';

export interface Questionnaire {
    id: string;
    domain: string;
    type: string;
    question: string;
    expected_response?: string;
    attachment_required: boolean;
    created_at: string;
    updated_at: string;
}

export interface QuestionnaireCreate {
    domain: string;
    type?: string;
    question: string;
    expected_response?: string;
    attachment_required?: boolean;
}

export interface QuestionnaireUpdate {
    domain?: string;
    type?: string;
    question?: string;
    expected_response?: string;
    attachment_required?: boolean;
}

export interface PaginatedQuestionnaires {
    items: Questionnaire[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

const BASE_URL = '/api/v1/questionnaires';

export const questionnaireApi = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; domain?: string }) => {
        const response = await apiClient.get<PaginatedQuestionnaires>(BASE_URL, { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<Questionnaire>(`${BASE_URL}/${id}`);
        return response.data;
    },

    create: async (data: QuestionnaireCreate) => {
        const response = await apiClient.post<Questionnaire>(BASE_URL, data);
        return response.data;
    },

    update: async (id: string, data: QuestionnaireUpdate) => {
        const response = await apiClient.put<Questionnaire>(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    uploadExcel: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<Questionnaire[]>(`${BASE_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
