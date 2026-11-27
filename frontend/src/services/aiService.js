import api from './api';

export const aiService = {
  analyze: (jobId) => api.post('/ai/analyze', jobId ? { jobId } : {}).then((r) => r.data),
  history: () => api.get('/ai/history').then((r) => r.data),
};
