import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { getAlbums, addAlbum, updateAlbum, deleteAlbum, getDirectors } from '../../services/otherServices';
import Modal from '../../components/common/Modal';
import { TableRowSkeleton } from '../../components/common/Skeletons';
import useApi from '../../hooks/useApi';
import { formatDate, getApiError, getFileUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY = { albumName: '', releaseDate: '', directorId: '' };

const AdminAlbumsPage = () => {
  const { data: albums,    loading,      refetch  } = useApi(getAlbums);
  const { data: directors } = useApi(getDirectors);

  const [modal,   setModal]   = useState(null);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [file,    setFile]    = useState(null);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);

  const openAdd  = () => { setForm(EMPTY); setFile(null); setErrors({}); setEditing(null); setModal('add'); };
  const openEdit = (a) => {
    setEditing(a);
    setForm({
      albumName:   a.albumName,
      releaseDate: a.releaseDate ? a.releaseDate.split('T')[0] : '',
      directorId:  a.directorId?._id || '',
    });
    setFile(null);
    setErrors({});
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditing(null); setFile(null); };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const handleSave = async () => {
    if (!form.albumName.trim()) { setErrors({ albumName: 'Album name is required' }); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('albumName', form.albumName.trim());
      if (form.releaseDate) formData.append('releaseDate', form.releaseDate);
      if (form.directorId)  formData.append('directorId', form.directorId);
      if (file)             formData.append('coverImage', file);

      if (modal === 'add') {
        await addAlbum(formData);
        toast.success('Album added!');
      } else {
        await updateAlbum(editing._id, formData);
        toast.success('Album updated!');
      }
      refetch();
      closeModal();
    } catch (err) { toast.error(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this album?')) return;
    try {
      await deleteAlbum(id);
      refetch();
      toast.success('Album deleted');
    } catch (err) { toast.error(getApiError(err)); }
  };

  return (
    <div>
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Albums</h1>
          <p className="page-subtitle">{albums?.length || 0} albums</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus size={15} /> Add Album</button>
      </div>

      <div className="table-wrap fade-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Album Name</th>
              <th className="hide-mobile">Director</th>
              <th className="hide-mobile">Release Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
              : albums?.map((a) => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 500 }}>{a.albumName}</td>
                  <td className="hide-mobile" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {a.directorId?.directorName || '—'}
                  </td>
                  <td className="hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {formatDate(a.releaseDate)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(a)}><FiEdit2 size={14} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(a._id)}
                        style={{ color: 'var(--accent-secondary)' }}><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!modal} onClose={closeModal} title={modal === 'add' ? 'Add Album' : 'Edit Album'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Album Name *</label>
            <input name="albumName" className={`form-input ${errors.albumName ? 'error' : ''}`}
              placeholder="Album title" value={form.albumName} onChange={handleChange} autoFocus />
            {errors.albumName && <span className="form-error">{errors.albumName}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Music Director</label>
            <select name="directorId" className="form-select" value={form.directorId} onChange={handleChange}>
              <option value="">— None —</option>
              {directors?.map((d) => <option key={d._id} value={d._id}>{d.directorName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Release Date</label>
            <input name="releaseDate" type="date" className="form-input"
              value={form.releaseDate} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Album Cover Image</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ 
                width: 60, height: 60, borderRadius: 8, overflow: 'hidden', 
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {file ? (
                  <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : editing?.coverImage ? (
                  <img src={getFileUrl(editing.coverImage)} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 20, opacity: 0.3 }}>🖼️</span>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFile(e.target.files[0])}
                style={{ fontSize: 13 }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <style>{`.table-wrap { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden; overflow-x: auto; }`}</style>
    </div>
  );
};

export default AdminAlbumsPage;
