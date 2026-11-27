import api from './api';

export const jobService = {
  list: (params) => api.get('/jobs', { params }).then((r) => r.data),
  stats: () => api.get('/jobs/stats').then((r) => r.data),
  get: (id) => api.get(`/jobs/${id}`).then((r) => r.data),
  mine: () => api.get('/jobs/mine/list').then((r) => r.data),
  create: (data) => api.post('/jobs', data).then((r) => r.data),
  update: (id, data) => api.put(`/jobs/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/jobs/${id}`).then((r) => r.data),
};
