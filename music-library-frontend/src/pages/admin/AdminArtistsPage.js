import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import {
  getArtists, addArtist, updateArtist, deleteArtist,
} from '../../services/otherServices';
import Modal from '../../components/common/Modal';
import { TableRowSkeleton } from '../../components/common/Skeletons';
import useApi from '../../hooks/useApi';
import { getFileUrl, getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminArtistsPage = () => {
  const { data: artists, loading, refetch } = useApi(getArtists);

  const [modal,   setModal]   = useState(null);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState({ artistName: '', artistPhoto: null });
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);

  const openAdd = () => { setForm({ artistName: '', artistPhoto: null }); setErrors({}); setEditing(null); setModal('add'); };
  const openEdit = (a) => { setEditing(a); setForm({ artistName: a.artistName, artistPhoto: null }); setErrors({}); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (name === 'artistPhoto') setForm((f) => ({ ...f, artistPhoto: files[0] }));
    else setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  };

  const handleSave = async () => {
    if (!form.artistName.trim()) { setErrors({ artistName: 'Artist name is required' }); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        const fd = new FormData();
        fd.append('artistName', form.artistName.trim());
        if (form.artistPhoto) fd.append('artistPhoto', form.artistPhoto);
        await addArtist(fd);
        toast.success('Artist added!');
      } else {
        await updateArtist(editing._id, { artistName: form.artistName.trim() });
        toast.success('Artist updated!');
      }
      refetch();
      closeModal();
    } catch (err) { toast.error(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this artist?')) return;
    try {
      await deleteArtist(id);
      refetch();
      toast.success('Artist deleted');
    } catch (err) { toast.error(getApiError(err)); }
  };

  return (
    <div>
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Artists</h1>
          <p className="page-subtitle">{artists?.length || 0} artists</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <FiPlus size={15} /> Add Artist
        </button>
      </div>

      <div className="table-wrap fade-in">
        <table className="data-table">
          <thead><tr><th>Photo</th><th>Artist Name</th><th>Actions</th></tr></thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={3} />)
              : artists?.map((a) => (
                <tr key={a._id}>
                  <td>
                    {a.artistPhoto ? (
                      <img src={getFileUrl(a.artistPhoto)} alt={a.artistName}
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--bg-overlay)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FiUser size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 500 }}>{a.artistName}</td>
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

      <Modal isOpen={!!modal} onClose={closeModal} title={modal === 'add' ? 'Add Artist' : 'Edit Artist'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Artist Name *</label>
            <input name="artistName" className={`form-input ${errors.artistName ? 'error' : ''}`}
              placeholder="Artist full name" value={form.artistName} onChange={handleChange} autoFocus />
            {errors.artistName && <span className="form-error">{errors.artistName}</span>}
          </div>
          {modal === 'add' && (
            <div className="form-group">
              <label className="form-label">Photo (optional)</label>
              <input name="artistPhoto" type="file" accept="image/*" className="form-input"
                onChange={handleChange} style={{ padding: '8px 12px' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      <style>{`.table-wrap { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden; overflow-x: auto; }`}</style>
    </div>
  );
};

export default AdminArtistsPage;
