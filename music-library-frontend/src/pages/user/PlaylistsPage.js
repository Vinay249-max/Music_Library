import React, { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import PlaylistCard from '../../components/playlists/PlaylistCard';
import Modal from '../../components/common/Modal';
import { PlaylistCardSkeleton } from '../../components/common/Skeletons';
import {
  getPlaylists, createPlaylist, updatePlaylist, deletePlaylist,
} from '../../services/playlistService';
import { validatePlaylist, hasErrors } from '../../utils/validation';
import { getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null); // null | 'create' | 'rename'
  const [editing,   setEditing]   = useState(null); // playlist being renamed
  const [nameVal,   setNameVal]   = useState('');
  const [nameErr,   setNameErr]   = useState('');
  const [saving,    setSaving]    = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPlaylists();
      setPlaylists(res.data);
    } catch (err) { toast.error(getApiError(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setNameVal(''); setNameErr(''); setModal('create'); };

  const openRename = (pl) => {
    setEditing(pl);
    setNameVal(pl.playlistName);
    setNameErr('');
    setModal('rename');
  };

  const closeModal = () => { setModal(null); setEditing(null); };

  const handleSave = async () => {
    const errs = validatePlaylist({ playlistName: nameVal });
    if (hasErrors(errs)) { setNameErr(errs.playlistName); return; }

    setSaving(true);
    try {
      if (modal === 'create') {
        const res = await createPlaylist({ playlistName: nameVal.trim() });
        setPlaylists((p) => [...p, res.data]);
        toast.success('Playlist created!');
      } else {
        const res = await updatePlaylist(editing._id, { playlistName: nameVal.trim() });
        setPlaylists((p) => p.map((pl) => pl._id === editing._id ? res.data : pl));
        toast.success('Playlist renamed!');
      }
      closeModal();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePlaylist(id);
      setPlaylists((p) => p.filter((pl) => pl._id !== id));
      toast.success('Playlist deleted');
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  return (
    <div>
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">My Playlists</h1>
          <p className="page-subtitle">
            {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus size={16} /> New Playlist
        </button>
      </div>

      {loading ? (
        <div className="playlists-grid">
          {Array.from({ length: 6 }).map((_, i) => <PlaylistCardSkeleton key={i} />)}
        </div>
      ) : playlists.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-state-icon">🎵</div>
          <div className="empty-state-title">No playlists yet</div>
          <p className="empty-state-text">Create your first playlist to start organising your music</p>
          <button className="btn btn-primary" onClick={openCreate}>
            <FiPlus size={14} /> Create Playlist
          </button>
        </div>
      ) : (
        <div className="playlists-grid fade-in">
          {playlists.map((pl) => (
            <PlaylistCard
              key={pl._id}
              playlist={pl}
              onDelete={handleDelete}
              onRename={openRename}
            />
          ))}
        </div>
      )}

      {/* Create / Rename modal */}
      <Modal
        isOpen={!!modal}
        onClose={closeModal}
        title={modal === 'create' ? 'New Playlist' : 'Rename Playlist'}
      >
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label">Playlist Name</label>
          <input
            className={`form-input ${nameErr ? 'error' : ''}`}
            placeholder="My Awesome Playlist…"
            value={nameVal}
            onChange={(e) => { setNameVal(e.target.value); setNameErr(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          {nameErr && <span className="form-error">{nameErr}</span>}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : modal === 'create' ? 'Create' : 'Rename'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PlaylistsPage;
