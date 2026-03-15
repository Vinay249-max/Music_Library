import api from './api';

// GET /api/playlists
export const getPlaylists = () => api.get('/playlists');

// POST /api/playlists
export const createPlaylist = (data) => api.post('/playlists', data);

// PUT /api/playlists/:id
export const updatePlaylist = (id, data) => api.put(`/playlists/${id}`, data);

// DELETE /api/playlists/:id
export const deletePlaylist = (id) => api.delete(`/playlists/${id}`);

// POST /api/playlists/:id/songs
export const addSongToPlaylist = (playlistId, songId) =>
  api.post(`/playlists/${playlistId}/songs`, { songId });

// DELETE /api/playlists/:id/songs/:songId
export const removeSongFromPlaylist = (playlistId, songId) =>
  api.delete(`/playlists/${playlistId}/songs/${songId}`);
