import api from './api';

// ── Notifications ─────────────────────────────
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);

// ── Artists ───────────────────────────────────
export const getArtists = () => api.get('/artists');
export const getArtistById = (id) => api.get(`/artists/${id}`);
export const getSongsByArtist = (id) => api.get(`/artists/${id}/songs`);
export const addArtist = (formData) =>
  api.post('/artists', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateArtist = (id, data) => api.put(`/artists/${id}`, data);
export const deleteArtist = (id) => api.delete(`/artists/${id}`);

// ── Music Directors ───────────────────────────
export const getDirectors = () => api.get('/directors');
export const getDirectorById = (id) => api.get(`/directors/${id}`);
export const getSongsByDirector = (id) => api.get(`/directors/${id}/songs`);
export const addDirector = (formData) =>
  api.post('/directors', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateDirector = (id, data) => api.put(`/directors/${id}`, data);
export const deleteDirector = (id) => api.delete(`/directors/${id}`);

// ── Albums ────────────────────────────────────
export const getAlbums = () => api.get('/albums');
export const addAlbum = (formData) => 
  api.post('/albums', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateAlbum = (id, formData) => 
  api.put(`/albums/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteAlbum = (id) => api.delete(`/albums/${id}`);
