// ── Client-side validation helpers ──────────────────────────────────

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? '' : 'Enter a valid email address';
};

export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone) ? '' : 'Enter a valid 10-digit mobile number';
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) return 'Password must be at least 6 characters';
  return '';
};

export const validateRequired = (value, label = 'This field') => {
  if (!value || !String(value).trim()) return `${label} is required`;
  return '';
};

export const validateRegister = ({ name, email, phone, password }) => {
  const errors = {};
  const nameErr = validateRequired(name, 'Name');
  if (nameErr) errors.name = nameErr;
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  const phoneErr = validatePhone(phone);
  if (phoneErr) errors.phone = phoneErr;
  const passErr = validatePassword(password);
  if (passErr) errors.password = passErr;
  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  if (!password) errors.password = 'Password is required';
  return errors;
};

export const validateSong = ({ songName, albumId, directorId }) => {
  const errors = {};
  if (!songName?.trim()) errors.songName = 'Song name is required';
  if (!albumId) errors.albumId = 'Album is required';
  if (!directorId) errors.directorId = 'Music director is required';
  return errors;
};

export const validatePlaylist = ({ playlistName }) => {
  const errors = {};
  if (!playlistName?.trim()) errors.playlistName = 'Playlist name is required';
  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;
