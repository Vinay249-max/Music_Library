const multer = require('multer');
const path = require('path');

// Helper to create storage config
const createStorage = (folder, nameFn) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, `uploads/${folder}`),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nameFn(req)}_${Date.now()}${ext}`);
  }
});

// Profile picture storage
const profileStorage = createStorage('profiles', () => 'profile');

// Song file storage — renamed to songName
const songStorage = createStorage('songs', (req) => {
  return req.body.songName
    ? req.body.songName.trim().replace(/\s+/g, '_')
    : `song_${Date.now()}`;
});

// Artist photo storage
const artistStorage = createStorage('artists', (req) => {
  return req.body.artistName
    ? req.body.artistName.trim().replace(/\s+/g, '_')
    : 'artist';
});

// Director photo storage
const directorStorage = createStorage('directors', (req) => {
  return req.body.directorName
    ? req.body.directorName.trim().replace(/\s+/g, '_')
    : 'director';
});

// Album photo storage
const albumStorage = createStorage('albums', (req) => {
  return req.body.albumName
    ? req.body.albumName.trim().replace(/\s+/g, '_')
    : 'album';
});

exports.uploadProfile  = multer({ storage: profileStorage });
exports.uploadSong     = multer({ storage: songStorage });
exports.uploadArtist   = multer({ storage: artistStorage });
exports.uploadDirector = multer({ storage: directorStorage });
exports.uploadAlbum    = multer({ storage: albumStorage });
