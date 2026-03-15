const Artist = require('../models/Artist');
const Song = require('../models/Song');
const fs = require('fs');

const getAllArtists = async () => await Artist.find();

const getArtistById = async (id) => {
  const artist = await Artist.findById(id);
  if (!artist) throw new Error('Artist not found');
  return artist;
};

const getSongsByArtistId = async (id) => {
  let songs = await Song.find({ artistId: id, isVisible: true })
    .populate('albumId')
    .populate('artistId')
    .populate('directorId');
    
  // Map filePath → clean fileUrl for audio playback
  return songs.map(s => {
    const obj = s.toObject();
    obj.filePath = (obj.filePath || '').replace(/\\/g, '/');
    return obj;
  });
};

const addArtist = async (data, photoPath) => {
  return await Artist.create({
    artistName:  data.artistName,
    artistPhoto: photoPath ? photoPath.replace(/\\/g, '/') : null
  });
};

const updateArtist = async (id, data) => {
  const artist = await Artist.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  if (!artist) throw new Error('Artist not found');
  return artist;
};

// Upload or replace artist photo — deletes old file
const updateArtistPhoto = async (id, newPhotoPath) => {
  const artist = await Artist.findById(id);
  if (!artist) throw new Error('Artist not found');

  // Delete old photo if exists
  if (artist.artistPhoto && fs.existsSync(artist.artistPhoto)) {
    fs.unlinkSync(artist.artistPhoto);
  }

  artist.artistPhoto = newPhotoPath ? newPhotoPath.replace(/\\/g, '/') : null;
  await artist.save();
  return artist;
};

const deleteArtist = async (id) => {
  const artist = await Artist.findByIdAndDelete(id);
  if (!artist) throw new Error('Artist not found');

  // Delete photo file if exists
  if (artist.artistPhoto && fs.existsSync(artist.artistPhoto)) {
    fs.unlinkSync(artist.artistPhoto);
  }

  return artist;
};

module.exports = { getAllArtists, getArtistById, getSongsByArtistId, addArtist, updateArtist, updateArtistPhoto, deleteArtist };
