import React, { useState, useCallback } from 'react';
import { FiFilter } from 'react-icons/fi';
import SearchBar from '../../components/common/SearchBar';
import SongCard from '../../components/songs/SongCard';
import { SongCardSkeleton } from '../../components/common/Skeletons';
import AddToPlaylistModal from './AddToPlaylistModal';
import { getSongs } from '../../services/songService';
import { getPlaylists } from '../../services/playlistService';
import useApi from '../../hooks/useApi';
import { usePlayer } from '../../context/PlayerContext';

const SongsPage = () => {
  const [filters, setFilters]         = useState({ search: '', artist: '', album: '', director: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const { data: songs, loading } = useApi(getSongs, filters, [JSON.stringify(filters)]);
  const { data: playlists } = useApi(getPlaylists);
  const { playQueue } = usePlayer();

  const handlePlay = useCallback((song) => {
    if (!songs) return;
    const idx = songs.findIndex((s) => s._id === song._id);
    playQueue(songs, idx >= 0 ? idx : 0);
  }, [songs, playQueue]);

  const handleSearch = useCallback((val) => {
    setFilters((f) => ({ ...f, search: val }));
  }, []);

  const handleFilter = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
  };

  return (
    <div>
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Music Library</h1>
          <p className="page-subtitle">
            {songs ? `${songs.length} songs available` : '…'}
          </p>
        </div>
        <button
          className={`btn btn-secondary btn-sm ${showFilters ? 'btn-active' : ''}`}
          onClick={() => setShowFilters((v) => !v)}
        >
          <FiFilter size={14} /> Filters
        </button>
      </div>

      {/* Search + Filters */}
      <div className="fade-in fade-in-delay-1" style={{ marginBottom: 24 }}>
        <SearchBar placeholder="Search by song name…" onSearch={handleSearch} />

        {showFilters && (
          <div className="filter-row fade-in" style={{ marginTop: 12 }}>
            <input
              className="form-input"
              placeholder="Filter by artist…"
              value={filters.artist}
              onChange={handleFilter('artist')}
            />
            <input
              className="form-input"
              placeholder="Filter by album…"
              value={filters.album}
              onChange={handleFilter('album')}
            />
            <input
              className="form-input"
              placeholder="Filter by director…"
              value={filters.director}
              onChange={handleFilter('director')}
            />
          </div>
        )}
      </div>

      {/* Songs grid */}
      <div className="songs-grid fade-in fade-in-delay-2">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SongCardSkeleton key={i} />)
          : songs?.length === 0
            ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="empty-state-icon">🎵</div>
                <div className="empty-state-title">No songs found</div>
                <p className="empty-state-text">Try adjusting your search or filters</p>
              </div>
            )
            : songs?.map((song) => (
              <SongCard
                key={song._id}
                song={song}
                onAddToPlaylist={setSelectedSong}
                onPlay={handlePlay}
              />
            ))
        }
      </div>

      {selectedSong && (
        <AddToPlaylistModal
          song={selectedSong}
          playlists={playlists || []}
          onClose={() => setSelectedSong(null)}
        />
      )}

      <style>{`
        .filter-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        .btn-active {
          border-color: var(--accent-primary) !important;
          color: var(--accent-primary) !important;
        }
      `}</style>
    </div>
  );
};

export default SongsPage;
