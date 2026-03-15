const fs = require('fs');
const path = require('path');
const Song = require('../models/Song');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all visible songs with optional search filters
const getAllSongs = async ({ search, artist, album, director }) => {
  let query = { isVisible: true };
  if (search) query.songName = { $regex: search, $options: 'i' };

  let result = await Song.find(query)
    .populate('albumId')
    .populate('artistId')
    .populate('directorId');

  if (artist)   result = result.filter(s => s.artistId.some(a => a.artistName?.match(new RegExp(artist, 'i'))));
  if (album)    result = result.filter(s => s.albumId?.albumName?.match(new RegExp(album, 'i')));
  if (director) result = result.filter(s => s.directorId?.directorName?.match(new RegExp(director, 'i')));

  // Map filePath → clean fileUrl for audio playback, keep raw filePath hidden
  return result.map(s => {
    const obj = s.toObject();
    const clean = (obj.filePath || '').replace(/\\/g, '/');
    obj.filePath = clean;   // normalised path for frontend getFileUrl helper
    return obj;
  });
};

// Get single song by ID
const getSongById = async (id) => {
  const song = await Song.findById(id)
    .populate('albumId')
    .populate('artistId')
    .populate('directorId');
    
  if (!song) throw new Error('Song not found');
  
  // Normalise backslashes for frontend
  const obj = song.toObject();
  obj.filePath = (obj.filePath || '').replace(/\\/g, '/');
  return obj;
};

// Add new song and broadcast notification to ALL users
const addSong = async (body, filePath, adminUserId) => {
  if (!filePath) throw new Error('Song file is required');

  const song = await Song.create({
    songName:   body.songName,
    albumId:    body.albumId,
    artistId:   JSON.parse(body.artistId || '[]'),
    directorId: body.directorId,
    duration:   body.duration,
    filePath:   filePath ? filePath.replace(/\\/g, '/') : null
  });

  // Broadcast: create one notification for EVERY user in the system
  const allUsers = await User.find({}, '_id');
  const notifications = allUsers.map(u => ({
    userId:  u._id,
    type:    'new_song',
    songId:  song._id,
    message: `New song added: ${song.songName}`
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  // Return fully populated song so frontend has artistName, albumName, etc. right away
  const populated = await Song.findById(song._id)
    .populate('albumId')
    .populate('artistId')
    .populate('directorId');

  const obj = populated.toObject();
  obj.filePath = (obj.filePath || '').replace(/\\/g, '/');
  return obj;
};

// Update song details
const updateSong = async (id, data) => {
  const song = await Song.findByIdAndUpdate(id, data, { returnDocument: 'after' })
    .populate('albumId')
    .populate('artistId')
    .populate('directorId');
  if (!song) throw new Error('Song not found');
  return song;
};

// Delete a song
const deleteSong = async (id) => {
  const song = await Song.findByIdAndDelete(id);
  if (!song) throw new Error('Song not found');

  if (song.filePath) {
    const fullPath = path.join(__dirname, '..', song.filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.error(`Error deleting file ${fullPath}:`, err);
    });
  }

  return song;
};

// Toggle song visibility (show/hide from users)
const toggleVisibility = async (id) => {
  const song = await Song.findById(id);
  if (!song) throw new Error('Song not found');
  song.isVisible = !song.isVisible;
  await song.save();
  return song;
};

module.exports = { getAllSongs, getSongById, addSong, updateSong, deleteSong, toggleVisibility };