import api from './api';

export const dashboardService = {
  seeker: () => api.get('/dashboard/seeker').then((r) => r.data),
  recruiter: () => api.get('/dashboard/recruiter').then((r) => r.data),
  admin: () => api.get('/dashboard/admin').then((r) => r.data),
};
