const Album = require('../models/Album');
const fs = require('fs');

const getAllAlbums = async () => await Album.find().populate('directorId');

const addAlbum = async (data, coverImagePath) => {
  return await Album.create({
    ...data,
    coverImage: coverImagePath ? coverImagePath.replace(/\\/g, '/') : null
  });
};

const updateAlbum = async (id, data, newCoverPath) => {
  const album = await Album.findById(id);
  if (!album) throw new Error('Album not found');

  // If a new cover is uploaded, delete the old one
  if (newCoverPath && album.coverImage && fs.existsSync(album.coverImage)) {
    try {
      fs.unlinkSync(album.coverImage);
    } catch (err) {
      console.error('Error deleting old album cover:', err);
    }
  }

  const payload = { ...data };
  if (newCoverPath) {
    payload.coverImage = newCoverPath.replace(/\\/g, '/');
  }

  return await Album.findByIdAndUpdate(id, payload, { returnDocument: 'after' });
};

const deleteAlbum = async (id) => {
  const album = await Album.findByIdAndDelete(id);
  if (!album) throw new Error('Album not found');

  // Delete cover file if exists
  if (album.coverImage && fs.existsSync(album.coverImage)) {
    try {
      fs.unlinkSync(album.coverImage);
    } catch (err) {
      console.error('Error deleting album cover:', err);
    }
  }

  return album;
};

module.exports = { getAllAlbums, addAlbum, updateAlbum, deleteAlbum };
