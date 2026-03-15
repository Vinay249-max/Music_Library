import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiPlay, FiShuffle, FiTrash2,
  FiPlusCircle, FiSearch, FiX
} from 'react-icons/fi';
import {
  getPlaylists, removeSongFromPlaylist,
} from '../../services/playlistService';
import { getSongs } from '../../services/songService';
import AddToPlaylistModal from './AddToPlaylistModal';
import { usePlayer } from '../../context/PlayerContext';
import { formatDuration, getApiError } from '../../utils/helpers';
import { Skeleton } from '../../components/common/Skeletons';
import toast from 'react-hot-toast';

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playQueue, isShuffle, toggleShuffle } = usePlayer();

  const [playlist,    setPlaylist]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSong, setShowAddSong] = useState(false);
  const [allSongs,    setAllSongs]    = useState([]);
  const [removing,    setRemoving]    = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([getPlaylists(), getSongs()]);
      const found = pRes.data.find((p) => p._id === id);
      if (!found) { navigate('/playlists'); return; }
      setPlaylist(found);
      setAllSongs(sRes.data);
    } catch (err) {
      toast.error(getApiError(err));
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemove = async (songId) => {
    setRemoving(songId);
    try {
      await removeSongFromPlaylist(id, songId);
      setPlaylist((p) => ({ ...p, songs: p.songs.filter((s) => s._id !== songId) }));
      toast.success('Song removed');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setRemoving(null);
    }
  };

  const handlePlay = (startIdx = 0) => {
    if (!playlist?.songs?.length) return;
    playQueue(playlist.songs, startIdx);
  };

  const handleShuffle = () => {
    if (!playlist?.songs?.length) return;
    const idx = Math.floor(Math.random() * playlist.songs.length);
    if (!isShuffle) toggleShuffle();
    playQueue(playlist.songs, idx);
  };

  // Filter songs in playlist by search query
  const filteredSongs = useMemo(() => {
    if (!playlist?.songs) return [];
    if (!searchQuery.trim()) return playlist.songs;
    const q = searchQuery.toLowerCase();
    return playlist.songs.filter((s) =>
      s.songName?.toLowerCase().includes(q) ||
      s.artistId?.some((a) => a.artistName?.toLowerCase().includes(q))
    );
  }, [playlist, searchQuery]);

  if (loading) {
    return (
      <div>
        <Skeleton height={32} width={100} style={{ marginBottom: 32 }} />
        <Skeleton height={56} width="50%" style={{ marginBottom: 16 }} />
        <Skeleton height={20} width="30%" style={{ marginBottom: 40 }} />
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <div className="fade-in">
      <button className="btn btn-ghost" onClick={() => navigate('/playlists')} style={{ marginBottom: 24 }}>
        <FiArrowLeft size={16} /> All Playlists
      </button>

      {/* Header */}
      <div className="pl-header">
        <div className="pl-cover">
          {playlist.songs?.length > 0
            ? playlist.songs.slice(0, 4).map((s, i) => (
              <div key={i} className="pl-cover-cell">
                {s.songName?.[0]?.toUpperCase() || '♪'}
              </div>
            ))
            : <span style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--text-muted)', opacity: 0.4 }}>♪</span>
          }
        </div>
        <div className="pl-header-info">
          <span className="badge badge-lime" style={{ marginBottom: 10 }}>Playlist</span>
          <h1 className="pl-title">{playlist.playlistName}</h1>
          <p className="pl-count">
            {playlist.songs?.length || 0} songs
          </p>
          <div className="pl-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => handlePlay(0)}
              disabled={!playlist.songs?.length}
            >
              <FiPlay size={18} style={{ marginLeft: 2 }} /> Play All
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={handleShuffle}
              disabled={!playlist.songs?.length}
            >
              <FiShuffle size={16} /> Shuffle
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowAddSong(true)}
            >
              <FiPlusCircle size={15} /> Add Songs
            </button>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Search inside playlist */}
      {playlist.songs?.length > 0 && (
        <div className="pl-search" style={{ marginBottom: 20 }}>
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <FiSearch size={14} style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
            }} />
            <input
              className="form-input"
              style={{ paddingLeft: 36 }}
              placeholder="Search in playlist…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                }}
              ><FiX size={14} /></button>
            )}
          </div>
        </div>
      )}

      {/* Song list */}
      {filteredSongs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎵</div>
          <div className="empty-state-title">
            {playlist.songs?.length === 0 ? 'Playlist is empty' : 'No matches'}
          </div>
          <p className="empty-state-text">
            {playlist.songs?.length === 0
              ? 'Add some songs to get started'
              : 'Try a different search term'}
          </p>
          {playlist.songs?.length === 0 && (
            <button className="btn btn-primary" onClick={() => setShowAddSong(true)}>
              <FiPlusCircle size={14} /> Add Songs
            </button>
          )}
        </div>
      ) : (
        <div className="pl-song-list">
          {filteredSongs.map((song, idx) => {
            const artists = Array.isArray(song.artistId)
              ? song.artistId.map((a) => a.artistName).join(', ')
              : '—';
            return (
              <div key={song._id} className="pl-song-row">
                <div className="pl-song-index">{idx + 1}</div>
                <button
                  className="pl-song-play-btn"
                  onClick={() => handlePlay(playlist.songs.indexOf(song))}
                  title="Play from here"
                >
                  <FiPlay size={13} style={{ marginLeft: 1 }} />
                </button>
                <div className="pl-song-info">
                  <div className="pl-song-name">{song.songName}</div>
                  <div className="pl-song-artist">{artists}</div>
                </div>
                <div className="pl-song-album hide-mobile">
                  {song.albumId?.albumName || '—'}
                </div>
                <div className="pl-song-dur">
                  {formatDuration(song.duration)}
                </div>
                <button
                  className="btn btn-ghost btn-icon btn-sm pl-song-remove"
                  onClick={() => handleRemove(song._id)}
                  disabled={removing === song._id}
                  title="Remove from playlist"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add song modal — reuse AddToPlaylistModal but for single playlist */}
      {showAddSong && (
        <AddToPlaylistModal
          song={null}
          playlists={[playlist]}
          onClose={() => { setShowAddSong(false); fetchData(); }}
          browseMode
          playlistId={id}
          allSongs={allSongs}
          existingSongIds={(playlist.songs || []).map((s) => s._id)}
        />
      )}

      <style>{`
        .pl-header {
          display: flex; gap: 36px; align-items: flex-start;
          flex-wrap: wrap; margin-bottom: 32px;
        }
        .pl-cover {
          width: 180px; height: 180px;
          border-radius: var(--radius-lg);
          background: var(--bg-elevated);
          border: 1px solid var(--border-visible);
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          flex-shrink: 0;
          align-items: center; justify-items: center;
        }
        .pl-cover-cell {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 32px;
          color: var(--text-muted); opacity: 0.5;
          background: var(--bg-overlay);
          border: 0.5px solid var(--border-subtle);
        }
        .pl-header-info { flex: 1; min-width: 220px; }
        .pl-title {
          font-family: var(--font-display);
          font-size: clamp(28px, 4vw, 48px);
          line-height: 1; margin-bottom: 6px;
        }
        .pl-count { font-size: 13px; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 24px; }
        .pl-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .pl-song-list { display: flex; flex-direction: column; }
        .pl-song-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          transition: background var(--transition-fast);
        }
        .pl-song-row:hover { background: var(--bg-elevated); }
        .pl-song-row:hover .pl-song-remove { opacity: 1; }
        .pl-song-index {
          width: 28px; text-align: right;
          font-family: var(--font-mono); font-size: 12px;
          color: var(--text-muted); flex-shrink: 0;
        }
        .pl-song-play-btn {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--accent-primary); color: var(--text-inverse);
          border: none; display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          opacity: 0; transition: opacity var(--transition-fast);
        }
        .pl-song-row:hover .pl-song-play-btn { opacity: 1; }
        .pl-song-info { flex: 1; min-width: 0; }
        .pl-song-name {
          font-size: 14px; font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pl-song-artist {
          font-size: 12px; color: var(--text-secondary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pl-song-album {
          font-size: 12px; color: var(--text-muted);
          width: 160px; flex-shrink: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pl-song-dur {
          font-family: var(--font-mono); font-size: 12px;
          color: var(--text-muted); width: 40px; flex-shrink: 0; text-align: right;
        }
        .pl-song-remove { opacity: 0; transition: opacity var(--transition-fast); }
      `}</style>
    </div>
  );
};

export default PlaylistDetailPage;
