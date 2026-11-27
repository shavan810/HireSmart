import api from './api';

const upload = (url, field, file) => {
  const form = new FormData();
  form.append(field, file);
  return api.post(url, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};

export const userService = {
  updateProfile: (data) => api.put('/users/profile', data).then((r) => r.data),
  uploadAvatar: (file) => upload('/users/avatar', 'image', file),
  uploadResume: (file) => upload('/users/resume', 'resume', file),
  deleteResume: () => api.delete('/users/resume').then((r) => r.data),
  updatePreferences: (data) => api.put('/users/preferences', data).then((r) => r.data),
  deleteAccount: (password) => api.delete('/users/me', { data: { password } }).then((r) => r.data),
};
