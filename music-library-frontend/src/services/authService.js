import api from './api';

export const register = (data) => api.post('/auth/register', data);

export const login = (data) => api.post('/auth/login', data);

export const getProfile = () => api.get('/auth/profile');

export const uploadProfilePicture = (formData) =>
  api.post('/auth/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
