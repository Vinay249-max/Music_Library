const UPLOADS_URL = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000';

/**
 * Build a full URL for a backend-uploaded file.
 * The backend stores paths like "uploads/songs/file.mp3"
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  // Normalise backslashes (Windows paths from backend)
  const clean = filePath.replace(/\\/g, '/');
  return `${UPLOADS_URL}/${clean}`;
};

/**
 * Format seconds → "m:ss"
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = String(Math.floor(seconds % 60)).padStart(2, '0');
  return `${m}:${s}`;
};

/**
 * Format ISO date → "DD MMM YYYY"
 */
export const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

/**
 * Get initials for avatar placeholder
 */
export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

/**
 * Extract the backend error message from an Axios error
 */
export const getApiError = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';

/**
 * Debounce a function
 */
export const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
