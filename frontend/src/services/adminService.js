import api from './api';

export const adminService = {
  users: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  setUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  jobs: (params) => api.get('/admin/jobs', { params }).then((r) => r.data),
  setJobStatus: (id, status) => api.patch(`/admin/jobs/${id}/status`, { status }).then((r) => r.data),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`).then((r) => r.data),
  applications: (params) => api.get('/admin/applications', { params }).then((r) => r.data),
};
