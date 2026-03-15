import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMusic, FiList, FiBell, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getSongs } from '../../services/songService';
import { getPlaylists } from '../../services/playlistService';
import SongCard from '../../components/songs/SongCard';
import { SongCardSkeleton } from '../../components/common/Skeletons';
import AddToPlaylistModal from '../user/AddToPlaylistModal';

const HomePage = () => {
  const { user } = useAuth();
  const [songs,     setSongs]     = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, pRes] = await Promise.all([getSongs(), getPlaylists()]);
        setSongs(sRes.data.slice(0, 8));
        setPlaylists(pRes.data);
      } catch (_) {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div>
      {/* Hero greeting */}
      <div className="home-hero fade-in">
        <div className="home-greeting">
          <span>{greeting},</span>
          <h1 className="home-name">{user?.name?.split(' ')[0] || 'Listener'}</h1>
        </div>
        <div className="home-stats">
          <div className="stat-pill">
            <FiList size={14} />
            <span>{playlists.length} playlists</span>
          </div>
          <div className="stat-pill">
            <FiMusic size={14} />
            <span>{songs.length > 0 ? `${songs.length}+ songs` : '…'}</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions fade-in fade-in-delay-1">
        <Link to="/songs" className="quick-action-card">
          <FiMusic size={22} style={{ color: 'var(--accent-primary)' }} />
          <span>Browse Library</span>
          <FiArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </Link>
        <Link to="/playlists" className="quick-action-card">
          <FiList size={22} style={{ color: 'var(--accent-blue)' }} />
          <span>My Playlists</span>
          <FiArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </Link>
        <Link to="/notifications" className="quick-action-card">
          <FiBell size={22} style={{ color: 'var(--accent-secondary)' }} />
          <span>Notifications</span>
          <FiArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </Link>
      </div>

      {/* Recent songs */}
      <div style={{ marginTop: 40 }}>
        <div className="page-header fade-in fade-in-delay-2">
          <div>
            <h2 className="page-title">Recently Added</h2>
            <p className="page-subtitle">Fresh tracks in the library</p>
          </div>
          <Link to="/songs" className="btn btn-secondary btn-sm">View All</Link>
        </div>

        <div className="songs-grid fade-in fade-in-delay-3">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SongCardSkeleton key={i} />)
            : songs.map((song) => (
                <SongCard
                  key={song._id}
                  song={song}
                  onAddToPlaylist={setSelectedSong}
                />
              ))
          }
        </div>
      </div>

      {selectedSong && (
        <AddToPlaylistModal
          song={selectedSong}
          playlists={playlists}
          onClose={() => setSelectedSong(null)}
        />
      )}

      <style>{`
        .home-hero {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-subtle);
          flex-wrap: wrap; gap: 16px;
        }
        .home-greeting { display: flex; flex-direction: column; gap: 2px; }
        .home-greeting span { font-size: 14px; color: var(--text-muted); }
        .home-name {
          font-family: var(--font-display);
          font-size: clamp(36px, 6vw, 64px);
          letter-spacing: 0.04em;
          line-height: 1;
        }
        .home-stats { display: flex; gap: 10px; align-items: center; }
        .stat-pill {
          display: flex; align-items: center; gap: 6px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 6px 14px;
          font-size: 12px; color: var(--text-secondary);
          font-family: var(--font-mono);
        }
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 8px;
        }
        .quick-action-card {
          display: flex; align-items: center; gap: 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 16px 18px;
          font-size: 14px; font-weight: 500;
          color: var(--text-primary);
          transition: all var(--transition-fast);
        }
        .quick-action-card:hover {
          border-color: var(--border-visible);
          background: var(--bg-elevated);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default HomePage;
