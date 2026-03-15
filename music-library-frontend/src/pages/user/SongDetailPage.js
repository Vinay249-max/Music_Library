import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlay, FiPlusCircle, FiCalendar, FiUser, FiDisc } from 'react-icons/fi';
import { getSongById } from '../../services/songService';
import { getPlaylists } from '../../services/playlistService';
import { formatDuration, formatDate, getApiError, getFileUrl } from '../../utils/helpers';
import { usePlayer } from '../../context/PlayerContext';
import AddToPlaylistModal from './AddToPlaylistModal';
import { Skeleton } from '../../components/common/Skeletons';
import toast from 'react-hot-toast';

const SongDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playQueue } = usePlayer();

  const [song,      setSong]      = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, pRes] = await Promise.all([getSongById(id), getPlaylists()]);
        setSong(sRes.data);
        setPlaylists(pRes.data);
      } catch (err) {
        toast.error(getApiError(err));
        navigate('/songs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div>
        <Skeleton height={36} width={120} style={{ marginBottom: 32 }} />
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <Skeleton height={240} width={240} borderRadius={16} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton height={48} width="60%" />
            <Skeleton height={20} width="40%" />
            <Skeleton height={20} width="50%" />
            <Skeleton height={20} width="35%" />
          </div>
        </div>
      </div>
    );
  }

  if (!song) return null;

  const artistNames = (Array.isArray(song.artistId) && song.artistId.length > 0)
    ? song.artistId.map((a) => a?.artistName).filter(Boolean).join(', ') || '—'
    : '—';

  const coverPhoto = song.albumId?.coverImage
    ? getFileUrl(song.albumId.coverImage)
    : (Array.isArray(song.artistId) && song.artistId.length > 0 && song.artistId[0]?.artistPhoto)
      ? getFileUrl(song.artistId[0].artistPhoto)
      : null;

  const details = [
    { icon: FiUser,     label: 'Artist(s)',       value: artistNames },
    { icon: FiDisc,     label: 'Album',            value: song.albumId?.albumName || '—' },
    { icon: FiUser,     label: 'Music Director',   value: song.directorId?.directorName || '—' },
    { icon: FiCalendar, label: 'Release Date',     value: formatDate(song.albumId?.releaseDate) },
    { icon: FiDisc,     label: 'Duration',         value: formatDuration(song.duration) },
  ];

  return (
    <div className="fade-in">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
        <FiArrowLeft size={16} /> Back
      </button>

      <div className="song-detail-layout">
        {/* Cover */}
        <div className="song-detail-cover">
          {coverPhoto ? (
            <img 
              src={coverPhoto} 
              alt={song.songName} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} 
            />
          ) : (
            <span className="song-detail-letter">
              {song.songName?.[0]?.toUpperCase() || '♪'}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="song-detail-info">
          <div className="badge badge-lime" style={{ marginBottom: 12 }}>Song</div>
          <h1 className="song-detail-title">{song.songName}</h1>
          <p className="song-detail-artist">{artistNames}</p>

          <div className="song-detail-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => playQueue([song], 0)}
            >
              <FiPlay size={18} style={{ marginLeft: 2 }} /> Play Now
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => setShowModal(true)}
            >
              <FiPlusCircle size={16} /> Add to Playlist
            </button>
          </div>

          <div className="song-detail-meta">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="song-meta-row">
                <div className="song-meta-label">
                  <Icon size={13} /> {label}
                </div>
                <div className="song-meta-value">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <AddToPlaylistModal
          song={song}
          playlists={playlists}
          onClose={() => setShowModal(false)}
        />
      )}

      <style>{`
        .song-detail-layout {
          display: flex;
          gap: 48px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .song-detail-cover {
          width: 240px; height: 240px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, var(--bg-elevated), var(--bg-overlay));
          border: 1px solid var(--border-visible);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .song-detail-letter {
          font-family: var(--font-display);
          font-size: 96px;
          color: var(--text-muted);
          opacity: 0.5;
          user-select: none;
        }
        .song-detail-info { flex: 1; min-width: 260px; }
        .song-detail-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 5vw, 56px);
          line-height: 1;
          margin-bottom: 8px;
        }
        .song-detail-artist { font-size: 16px; color: var(--text-secondary); margin-bottom: 28px; }
        .song-detail-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 36px; }
        .song-detail-meta {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .song-meta-row {
          display: flex; align-items: center;
          padding: 14px 18px;
          border-bottom: 1px solid var(--border-subtle);
          gap: 12px;
        }
        .song-meta-row:last-child { border-bottom: none; }
        .song-meta-label {
          display: flex; align-items: center; gap: 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--text-muted);
          width: 140px; flex-shrink: 0;
        }
        .song-meta-value { font-size: 14px; font-weight: 500; color: var(--text-primary); }
      `}</style>
    </div>
  );
};

export default SongDetailPage;
