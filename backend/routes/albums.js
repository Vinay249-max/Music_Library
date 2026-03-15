const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadAlbum } = require('../middleware/upload');
const albumService = require('../services/albumService');

router.get('/', protect, async (req, res) => {
  try { res.json(await albumService.getAllAlbums()); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, adminOnly, uploadAlbum.single('coverImage'), async (req, res) => {
  try {
    res.status(201).json(await albumService.addAlbum(req.body, req.file ? req.file.path : null));
  }
  catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, adminOnly, uploadAlbum.single('coverImage'), async (req, res) => {
  try {
    res.json(await albumService.updateAlbum(req.params.id, req.body, req.file ? req.file.path : null));
  }
  catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await albumService.deleteAlbum(req.params.id); res.json({ message: 'Album deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
