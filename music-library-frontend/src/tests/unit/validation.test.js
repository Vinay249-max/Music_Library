// src/tests/unit/validation.test.js
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRegister,
  validateLogin,
  validateSong,
  validatePlaylist,
  hasErrors,
} from '../../utils/validation';

describe('validateEmail', () => {
  test('accepts valid email', () => expect(validateEmail('a@b.com')).toBe(''));
  test('rejects missing @', () => expect(validateEmail('notanemail')).toBeTruthy());
  test('rejects empty string', () => expect(validateEmail('')).toBeTruthy());
});

describe('validatePhone', () => {
  test('accepts valid 10-digit Indian mobile', () => expect(validatePhone('9876543210')).toBe(''));
  test('rejects 9-digit number', () => expect(validatePhone('987654321')).toBeTruthy());
  test('rejects number starting with 1', () => expect(validatePhone('1234567890')).toBeTruthy());
  test('rejects letters', () => expect(validatePhone('abcdefghij')).toBeTruthy());
});

describe('validatePassword', () => {
  test('accepts password ≥ 6 chars', () => expect(validatePassword('secret')).toBe(''));
  test('rejects password < 6 chars', () => expect(validatePassword('abc')).toBeTruthy());
  test('rejects empty', () => expect(validatePassword('')).toBeTruthy());
});

describe('validateRegister', () => {
  const valid = { name: 'Test User', email: 'test@ex.com', phone: '9876543210', password: 'pass123' };

  test('returns no errors for valid data', () => {
    expect(hasErrors(validateRegister(valid))).toBe(false);
  });

  test('returns error for missing name', () => {
    const r = validateRegister({ ...valid, name: '' });
    expect(r.name).toBeTruthy();
  });

  test('returns error for bad email', () => {
    const r = validateRegister({ ...valid, email: 'bad' });
    expect(r.email).toBeTruthy();
  });

  test('returns error for short password', () => {
    const r = validateRegister({ ...valid, password: '12' });
    expect(r.password).toBeTruthy();
  });
});

describe('validateSong', () => {
  test('accepts valid song data', () => {
    const r = validateSong({ songName: 'My Song', albumId: 'id1', directorId: 'id2' });
    expect(hasErrors(r)).toBe(false);
  });

  test('rejects missing songName', () => {
    const r = validateSong({ songName: '', albumId: 'id1', directorId: 'id2' });
    expect(r.songName).toBeTruthy();
  });
});

describe('validatePlaylist', () => {
  test('accepts valid playlist name', () => {
    expect(hasErrors(validatePlaylist({ playlistName: 'Chill Vibes' }))).toBe(false);
  });
  test('rejects empty name', () => {
    expect(hasErrors(validatePlaylist({ playlistName: '' }))).toBe(true);
  });
});
