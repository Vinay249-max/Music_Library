import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { addSongToPlaylist, createPlaylist } from '../../services/playlistService';
import { FiPlus, FiCheck } from 'react-icons/fi';
import { getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AddToPlaylistModal = ({ 
  song, 
  playlists: initialPlaylists, 
  onClose,
  browseMode = false,
  playlistId = null,
  allSongs = [],
  existingSongIds = []
}) => {
  const [playlists, setPlaylists] = useState(initialPlaylists || []);
  const [search,    setSearch]    = useState('');
  const [newName,   setNewName]   = useState('');
  const [creating,  setCreating]  = useState(false);
  const [adding,    setAdding]    = useState(null);
  const [added,     setAdded]     = useState({});

  const handleAdd = async (pId, sId) => {
    const targetPlaylistId = browseMode ? playlistId : pId;
    const targetSongId     = browseMode ? sId : song._id;

    setAdding(browseMode ? sId : pId);
    try {
      await addSongToPlaylist(targetPlaylistId, targetSongId);
      setAdded((a) => ({ ...a, [browseMode ? sId : pId]: true }));
      toast.success('Song added!');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setAdding(null);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await createPlaylist({ playlistName: newName.trim() });
      const pl = res.data;
      setPlaylists((p) => [...p, pl]);
      setNewName('');
      toast.success(`"${pl.playlistName}" created`);
      if (!browseMode) {
        await handleAdd(pl._id);
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setCreating(false);
    }
  };

  const filteredSongs = allSongs.filter(s => {
    const isAlreadyIn = existingSongIds.includes(s._id);
    if (isAlreadyIn) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.songName?.toLowerCase().includes(q) || 
           s.artistId?.some(a => a.artistName?.toLowerCase().includes(q));
  });

  return (
    <Modal isOpen title={browseMode ? 'Add Songs to Playlist' : 'Add to Playlist'} onClose={onClose}>
      {!browseMode && song && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Adding: <strong style={{ color: 'var(--text-primary)' }}>{song.songName}</strong>
        </p>
      )}

      {browseMode ? (
        <div style={{ marginBottom: 20 }}>
          <input
            className="form-input"
            placeholder="Search songs to add…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            className="form-input"
            placeholder="New playlist name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            style={{ flexShrink: 0 }}
          >
            <FiPlus size={14} /> Create
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
        {browseMode ? (
          filteredSongs.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No songs found to add</p>
          ) : (
            filteredSongs.map(s => {
              const artists = s.artistId?.map(a => a.artistName).join(', ') || '—';
              const isAdded = added[s._id];
              return (
                <div key={s._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.songName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{artists}</div>
                  </div>
                  <button
                    className={`btn btn-sm ${isAdded ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => !isAdded && handleAdd(null, s._id)}
                    disabled={adding === s._id || isAdded}
                    style={{ flexShrink: 0 }}
                  >
                    {isAdded ? <FiCheck size={13} /> : adding === s._id ? '…' : 'Add'}
                  </button>
                </div>
              );
            })
          )
        ) : (
          playlists.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No playlists yet. Create one above!</p>
          ) : (
            playlists.map((pl) => (
              <div key={pl._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{pl.playlistName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {pl.songs?.length || 0} songs
                  </div>
                </div>
                <button
                  className={`btn btn-sm ${added[pl._id] ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => !added[pl._id] && handleAdd(pl._id)}
                  disabled={adding === pl._id || added[pl._id]}
                >
                  {added[pl._id] ? <><FiCheck size={13} /> Added</> : adding === pl._id ? '…' : 'Add'}
                </button>
              </div>
            ))
          )
        )}
      </div>
    </Modal>
  );
};

export default AddToPlaylistModal;
