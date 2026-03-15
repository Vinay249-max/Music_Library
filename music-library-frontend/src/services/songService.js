import api from './api';

// GET /api/songs?search=&artist=&album=&director=
export const getSongs = (params = {}) => api.get('/songs', { params });

// GET /api/songs/:id
export const getSongById = (id) => api.get(`/songs/${id}`);

// POST /api/songs  (admin, multipart)
export const addSong = (formData) =>
  api.post('/songs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// PUT /api/songs/:id  (admin, JSON)
export const updateSong = (id, data) => api.put(`/songs/${id}`, data);

// DELETE /api/songs/:id  (admin)
export const deleteSong = (id) => api.delete(`/songs/${id}`);

// PATCH /api/songs/:id/visibility  (admin)
export const toggleVisibility = (id) => api.patch(`/songs/${id}/visibility`);
