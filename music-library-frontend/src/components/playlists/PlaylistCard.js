import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiEdit2, FiTrash2, FiMusic } from 'react-icons/fi';
import { usePlayer } from '../../context/PlayerContext';

const PlaylistCard = ({ playlist, onDelete, onRename }) => {
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const songCount = playlist.songs?.length || 0;

  const handlePlay = (e) => {
    e.stopPropagation();
    if (playlist.songs?.length) {
      playQueue(playlist.songs, 0);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(playlist._id);
  };

  return (
    <div className="playlist-card" onClick={() => navigate(`/playlists/${playlist._id}`)}>
      <div className="playlist-card-icon">
        <FiMusic size={28} style={{ color: 'var(--accent-primary)' }} />
      </div>
      <div className="playlist-card-body">
        <div className="playlist-card-name">{playlist.playlistName}</div>
        <div className="playlist-card-count">
          {songCount} {songCount === 1 ? 'song' : 'songs'}
        </div>
      </div>
      <div className="playlist-card-actions">
        {songCount > 0 && (
          <button className="btn btn-primary btn-sm" onClick={handlePlay}>
            <FiPlay size={13} style={{ marginLeft: 1 }} /> Play
          </button>
        )}
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={(e) => { e.stopPropagation(); onRename(playlist); }}
          title="Rename"
        >
          <FiEdit2 size={14} />
        </button>
        <button
          className={`btn btn-sm ${confirmDelete ? 'btn-danger' : 'btn-ghost btn-icon'}`}
          onClick={handleDelete}
          onBlur={() => setConfirmDelete(false)}
          title="Delete"
        >
          {confirmDelete ? 'Confirm?' : <FiTrash2 size={14} />}
        </button>
      </div>

      <style>{`
        .playlist-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 20px;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .playlist-card:hover {
          border-color: var(--border-visible);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .playlist-card-icon {
          width: 52px; height: 52px;
          border-radius: var(--radius-md);
          background: rgba(232,255,71,0.08);
          display: flex; align-items: center; justify-content: center;
        }
        .playlist-card-name {
          font-size: 16px; font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .playlist-card-count {
          font-size: 12px; color: var(--text-muted);
          font-family: var(--font-mono);
        }
        .playlist-card-actions {
          display: flex; gap: 8px; align-items: center;
          flex-wrap: wrap;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default PlaylistCard;
