import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSearch } from 'react-icons/fi';
import {
  getSongs, addSong, updateSong, deleteSong, toggleVisibility,
} from '../../services/songService';
import { getArtists, getDirectors, getAlbums } from '../../services/otherServices';
import Modal from '../../components/common/Modal';
import { TableRowSkeleton } from '../../components/common/Skeletons';
import { validateSong, hasErrors } from '../../utils/validation';
import { formatDuration, getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  songName: '', albumId: '', directorId: '', artistId: [], duration: '', songFile: null,
};

const AdminSongsPage = () => {
  const [songs,     setSongs]     = useState([]);
  const [artists,   setArtists]   = useState([]);
  const [directors, setDirectors] = useState([]);
  const [albums,    setAlbums]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  const [modal,   setModal]   = useState(null); // null | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, arRes, dirRes, alRes] = await Promise.all([
        getSongs({}), getArtists(), getDirectors(), getAlbums(),
      ]);
      // Admin sees all songs (visible + hidden via backend returning isVisible field)
      setSongs(sRes.data);
      setArtists(arRes.data);
      setDirectors(dirRes.data);
      setAlbums(alRes.data);
    } catch (err) { toast.error(getApiError(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM); setErrors({}); setEditing(null); setModal('add');
  };
  const openEdit = (song) => {
    setEditing(song);
    setForm({
      songName:   song.songName || '',
      albumId:    song.albumId?._id || '',
      directorId: song.directorId?._id || '',
      artistId:   (song.artistId || []).map((a) => a._id),
      duration:   song.duration || '',
      songFile:   null,
    });
    setErrors({});
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'songFile') {
      setForm((f) => ({ ...f, songFile: files[0] }));
    } else if (name === 'artistId') {
      // Multi-select
      const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
      setForm((f) => ({ ...f, artistId: selected }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
    setErrors((er) => ({ ...er, [name]: '' }));
  };

  const handleSave = async () => {
    const errs = validateSong(form);
    if (modal === 'add' && !form.songFile) errs.songFile = 'Song file is required';
    if (hasErrors(errs)) { setErrors(errs); return; }

    setSaving(true);
    try {
      if (modal === 'add') {
        const fd = new FormData();
        fd.append('songName',   form.songName);
        fd.append('albumId',    form.albumId);
        fd.append('directorId', form.directorId);
        fd.append('artistId',   JSON.stringify(form.artistId));
        if (form.duration) fd.append('duration', form.duration);
        fd.append('songFile', form.songFile);
        await addSong(fd);
        await load();
        toast.success('Song added & notifications sent!');
      } else {
        const res = await updateSong(editing._id, {
          songName:   form.songName,
          albumId:    form.albumId,
          directorId: form.directorId,
          artistId:   form.artistId,
          duration:   form.duration,
        });
        setSongs((s) => s.map((x) => x._id === editing._id ? res.data : x));
        toast.success('Song updated!');
      }
      closeModal();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this song permanently?')) return;
    try {
      await deleteSong(id);
      setSongs((s) => s.filter((x) => x._id !== id));
      toast.success('Song deleted');
    } catch (err) { toast.error(getApiError(err)); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleVisibility(id);
      setSongs((s) => s.map((x) => x._id === id ? res.data.song : x));
      toast.success(res.data.message);
    } catch (err) { toast.error(getApiError(err)); }
  };

  const filtered = songs.filter((s) =>
    s.songName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Songs</h1>
          <p className="page-subtitle">{songs.length} total songs</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <FiPlus size={15} /> Add Song
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 24 }} className="fade-in">
        <FiSearch size={15} style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-muted)',
        }} />
        <input
          className="form-input"
          style={{ paddingLeft: 36 }}
          placeholder="Search songs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-wrap fade-in fade-in-delay-1">
        <table className="data-table">
          <thead>
            <tr>
              <th>Song</th>
              <th>Artist(s)</th>
              <th className="hide-mobile">Album</th>
              <th className="hide-mobile">Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              : filtered.map((song) => {
                const artists = (Array.isArray(song.artistId) && song.artistId.length > 0)
                  ? song.artistId.map((a) => a?.artistName).filter(Boolean).join(', ') || '—'
                  : '—';
                return (
                  <tr key={song._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{song.songName}</div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{artists || '—'}</td>
                    <td className="hide-mobile" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {song.albumId?.albumName || '—'}
                    </td>
                    <td className="hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {formatDuration(song.duration)}
                    </td>
                    <td>
                      <span className={`badge ${song.isVisible ? 'badge-lime' : 'badge-red'}`}>
                        {song.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleToggle(song._id)}
                          title={song.isVisible ? 'Hide' : 'Show'}
                        >
                          {song.isVisible ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => openEdit(song)}
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleDelete(song._id)}
                          title="Delete"
                          style={{ color: 'var(--accent-secondary)' }}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            }
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No songs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={!!modal}
        onClose={closeModal}
        title={modal === 'add' ? 'Add New Song' : 'Edit Song'}
        maxWidth={520}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Song Name *</label>
            <input name="songName" className={`form-input ${errors.songName ? 'error' : ''}`}
              placeholder="Enter song name" value={form.songName} onChange={handleChange} />
            {errors.songName && <span className="form-error">{errors.songName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Album *</label>
            <select name="albumId" className={`form-select ${errors.albumId ? 'error' : ''}`}
              value={form.albumId} onChange={handleChange}>
              <option value="">— Select Album —</option>
              {albums.map((a) => <option key={a._id} value={a._id}>{a.albumName}</option>)}
            </select>
            {errors.albumId && <span className="form-error">{errors.albumId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Music Director *</label>
            <select name="directorId" className={`form-select ${errors.directorId ? 'error' : ''}`}
              value={form.directorId} onChange={handleChange}>
              <option value="">— Select Director —</option>
              {directors.map((d) => <option key={d._id} value={d._id}>{d.directorName}</option>)}
            </select>
            {errors.directorId && <span className="form-error">{errors.directorId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Artist(s) <span style={{ color: 'var(--text-muted)' }}>(Ctrl+click for multiple)</span></label>
            <select name="artistId" className="form-select" multiple
              value={form.artistId} onChange={handleChange} style={{ height: 100 }}>
              {artists.map((a) => <option key={a._id} value={a._id}>{a.artistName}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Duration (seconds)</label>
            <input name="duration" type="number" className="form-input"
              placeholder="e.g. 240" value={form.duration} onChange={handleChange} />
          </div>

          {modal === 'add' && (
            <div className="form-group">
              <label className="form-label">Song File (MP3) *</label>
              <input name="songFile" type="file" accept="audio/*"
                className="form-input" onChange={handleChange} style={{ padding: '8px 12px' }} />
              {errors.songFile && <span className="form-error">{errors.songFile}</span>}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : modal === 'add' ? 'Add Song' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        .table-wrap {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden; overflow-x: auto;
        }
      `}</style>
    </div>
  );
};

export default AdminSongsPage;
