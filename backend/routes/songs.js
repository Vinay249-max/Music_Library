const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadSong } = require('../middleware/upload');
const songService = require('../services/songService');


// Get all visible songs with optional search
router.get('/', protect, async (req, res) => {
  try {
    const songs = await songService.getAllSongs(req.query);
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const song = await songService.getSongById(req.params.id);
    res.json(song);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Admin: Add song with file upload
router.post(
  '/',
  protect,
  adminOnly,
  uploadSong.single('songFile'),
  async (req, res) => {
    try {
      const song = await songService.addSong(
        req.body,
        req.file ? req.file.path : null,
        req.user.id
      );

      res.status(201).json(song); // FIXED
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);


// Admin: Update song
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const song = await songService.updateSong(req.params.id, req.body);
    res.json(song);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Admin: Delete song
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await songService.deleteSong(req.params.id);
    res.json({ message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Admin: Toggle visibility
router.patch('/:id/visibility', protect, adminOnly, async (req, res) => {
  try {
    const song = await songService.toggleVisibility(req.params.id);

    res.json({
      message: `Song is now ${song.isVisible ? 'visible' : 'hidden'}`,
      song
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;