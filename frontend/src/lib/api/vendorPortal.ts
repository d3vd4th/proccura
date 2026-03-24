import api from '@/api/axios';

export const VendorPortalService = {
  getAssignedQuestionnaires: async () => {
    const response = await api.get('/api/v1/vendor-portal/questionnaires');
    return response.data;
  },

  submitQuestionnaires: async (payload: { responses: { assignment_id: string; response: string }[] }) => {
    const response = await api.post('/api/v1/vendor-portal/questionnaires/submit', payload);
    return response.data;
  }
};
