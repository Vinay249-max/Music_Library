import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiPlusCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { formatDuration, getFileUrl } from '../../utils/helpers';
import { usePlayer } from '../../context/PlayerContext';

const SongCard = ({ song, onAddToPlaylist, isAdmin, onToggleVisibility, onPlay }) => {
  const navigate = useNavigate();
  const { playQueue } = usePlayer();

  const artistNames = (Array.isArray(song.artistId) && song.artistId.length > 0)
    ? song.artistId.map((a) => a?.artistName).filter(Boolean).join(', ') || '—'
    : '—';

  const coverPhoto = song.albumId?.coverImage
    ? getFileUrl(song.albumId.coverImage)
    : (Array.isArray(song.artistId) && song.artistId.length > 0 && song.artistId[0]?.artistPhoto)
      ? getFileUrl(song.artistId[0].artistPhoto)
      : null;

  const albumName = song.albumId?.albumName || '—';

  const handlePlay = (e) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(song);
    } else {
      playQueue([song], 0);
    }
  };

  return (
    <div className="song-card fade-in" onClick={() => navigate(`/songs/${song._id}`)}>
      {/* Cover placeholder with gradient */}
      <div className="song-card-cover">
        <div className="song-cover-art">
          {coverPhoto ? (
            <img 
              src={coverPhoto} 
              alt={song.songName} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <span className="song-cover-letter">
              {song.songName?.[0]?.toUpperCase() || '♪'}
            </span>
          )}
        </div>
        <button className="song-play-btn" onClick={handlePlay} title="Play">
          <FiPlay size={18} style={{ marginLeft: 2 }} />
        </button>
        {!song.isVisible && (
          <span className="song-hidden-badge">Hidden</span>
        )}
      </div>

      <div className="song-card-body">
        <div className="song-card-title">{song.songName}</div>
        <div className="song-card-meta">{artistNames}</div>
        <div className="song-card-sub">{albumName}</div>

        <div className="song-card-footer">
          <span className="song-duration">{formatDuration(song.duration)}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {isAdmin ? (
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={(e) => { e.stopPropagation(); onToggleVisibility?.(song._id); }}
                title={song.isVisible ? 'Hide song' : 'Show song'}
              >
                {song.isVisible ? <FiEye size={15} /> : <FiEyeOff size={15} />}
              </button>
            ) : (
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={(e) => { e.stopPropagation(); onAddToPlaylist?.(song); }}
                title="Add to playlist"
              >
                <FiPlusCircle size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .song-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: pointer;
          transition: border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .song-card:hover {
          border-color: var(--border-visible);
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        .song-card-cover {
          position: relative;
          aspect-ratio: 1;
          background: var(--bg-elevated);
          overflow: hidden;
        }
        .song-cover-art {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--bg-elevated), var(--bg-overlay));
        }
        .song-cover-letter {
          font-family: var(--font-display);
          font-size: 48px;
          color: var(--text-muted);
          opacity: 0.6;
          user-select: none;
        }
        .song-play-btn {
          position: absolute;
          bottom: 10px; right: 10px;
          width: 36px; height: 36px;
          border-radius: 50%;
          background: var(--accent-primary);
          color: var(--text-inverse);
          border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          opacity: 0;
          transform: scale(0.85);
          transition: opacity var(--transition-fast), transform var(--transition-fast);
        }
        .song-card:hover .song-play-btn {
          opacity: 1;
          transform: scale(1);
        }
        .song-hidden-badge {
          position: absolute;
          top: 8px; left: 8px;
          background: rgba(255,77,109,0.85);
          color: #fff;
          font-size: 10px; font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-family: var(--font-mono);
          letter-spacing: 0.06em;
        }
        .song-card-body { padding: 12px; }
        .song-card-title {
          font-size: 14px; font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 3px;
        }
        .song-card-meta {
          font-size: 12px; color: var(--text-secondary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .song-card-sub {
          font-size: 11px; color: var(--text-muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-top: 2px;
        }
        .song-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--border-subtle);
        }
        .song-duration {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default SongCard;
