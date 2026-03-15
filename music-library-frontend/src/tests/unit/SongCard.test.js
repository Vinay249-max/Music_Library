// src/tests/unit/SongCard.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SongCard from '../../components/songs/SongCard';
import { PlayerProvider } from '../../context/PlayerContext';

const mockSong = {
  _id: 'song1',
  songName: 'Kun Faya Kun',
  artistId: [{ _id: 'a1', artistName: 'Mohit Chauhan' }],
  albumId:  { _id: 'al1', albumName: 'Rockstar' },
  directorId: { _id: 'd1', directorName: 'A.R. Rahman' },
  duration: 352,
  isVisible: true,
};

const renderCard = (props = {}) =>
  render(
    <MemoryRouter>
      <PlayerProvider>
        <SongCard song={mockSong} {...props} />
      </PlayerProvider>
    </MemoryRouter>
  );

describe('SongCard', () => {
  test('renders song name', () => {
    renderCard();
    expect(screen.getByText('Kun Faya Kun')).toBeInTheDocument();
  });

  test('renders artist name', () => {
    renderCard();
    expect(screen.getByText('Mohit Chauhan')).toBeInTheDocument();
  });

  test('renders album name', () => {
    renderCard();
    expect(screen.getByText('Rockstar')).toBeInTheDocument();
  });

  test('calls onAddToPlaylist when add button clicked', () => {
    const onAdd = jest.fn();
    renderCard({ onAddToPlaylist: onAdd });
    // Hover to reveal the button then click
    const addBtn = screen.getByTitle('Add to playlist');
    fireEvent.click(addBtn);
    expect(onAdd).toHaveBeenCalledWith(mockSong);
  });

  test('shows Hidden badge when song is not visible', () => {
    renderCard({ song: { ...mockSong, isVisible: false } });
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });

  test('shows admin visibility toggle in admin mode', () => {
    const onToggle = jest.fn();
    renderCard({ isAdmin: true, onToggleVisibility: onToggle });
    const toggleBtn = screen.getByTitle('Hide song');
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledWith('song1');
  });
});
