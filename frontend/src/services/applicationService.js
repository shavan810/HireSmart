import api from './api';

export const applicationService = {
  apply: (jobId, data) => api.post(`/applications/${jobId}`, data).then((r) => r.data),
  mine: () => api.get('/applications/mine').then((r) => r.data),
  withdraw: (id) => api.delete(`/applications/${id}`).then((r) => r.data),
  forRecruiter: (params) => api.get('/applications/recruiter', { params }).then((r) => r.data),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data).then((r) => r.data),
};
