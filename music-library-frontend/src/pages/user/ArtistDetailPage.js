import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser } from 'react-icons/fi';
import { getArtistById, getSongsByArtist } from '../../services/otherServices';
import { getPlaylists } from '../../services/playlistService';
import { getFileUrl, getApiError } from '../../utils/helpers';
import SongCard from '../../components/songs/SongCard';
import { SongCardSkeleton } from '../../components/common/Skeletons';
import AddToPlaylistModal from './AddToPlaylistModal';
import toast from 'react-hot-toast';

const ArtistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, sRes, pRes] = await Promise.all([
          getArtistById(id),
          getSongsByArtist(id),
          getPlaylists()
        ]);
        setArtist(aRes.data);
        setSongs(sRes.data);
        setPlaylists(pRes.data);
      } catch (err) {
        toast.error(getApiError(err));
        navigate('/artists');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (!artist && !loading) return null;

  return (
    <div className="fade-in">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
        <FiArrowLeft size={16} /> Back
      </button>

      {/* Artist Detail Header */}
      <div className="artist-detail-header">
        <div className="artist-detail-photo">
          {loading ? (
            <div className="skeleton-box" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          ) : artist?.artistPhoto ? (
            <img src={getFileUrl(artist.artistPhoto)} alt={artist?.artistName} />
          ) : (
            <div className="entity-photo-placeholder"><FiUser size={64} /></div>
          )}
        </div>
        
        <div className="artist-detail-info">
          {loading ? (
            <>
              <div className="skeleton-text" style={{ width: '200px', height: '48px', marginBottom: '8px' }} />
              <div className="skeleton-text" style={{ width: '100px', height: '24px' }} />
            </>
          ) : (
            <>
              <div className="badge badge-lime" style={{ marginBottom: 12 }}>Artist</div>
              <h1 className="artist-detail-title">{artist.artistName}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {songs.length} {songs.length === 1 ? 'song' : 'songs'} available
              </p>
            </>
          )}
        </div>
      </div>

      <div className="section-divider" style={{ margin: '40px 0', borderBottom: '1px solid var(--border-subtle)' }} />

      <h2 style={{ fontSize: 24, marginBottom: 24 }}>Popular Songs</h2>

      <div className="songs-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SongCardSkeleton key={i} />)
          : songs.length === 0
            ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="empty-state-icon">🎵</div>
                <div className="empty-state-title">No songs found</div>
                <p className="empty-state-text">This artist hasn't released any songs yet.</p>
              </div>
            )
            : songs.map((song) => (
              <SongCard
                key={song._id}
                song={song}
                onAddToPlaylist={setSelectedSong}
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
        .artist-detail-header {
          display: flex;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
        }
        .artist-detail-photo {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: var(--bg-surface);
          border: 4px solid var(--bg-elevated);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
        }
        .artist-detail-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .entity-photo-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          background: var(--bg-overlay);
        }
        .artist-detail-title {
          font-family: var(--font-display);
          font-size: clamp(36px, 5vw, 64px);
          line-height: 1.1;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

export default ArtistDetailPage;
