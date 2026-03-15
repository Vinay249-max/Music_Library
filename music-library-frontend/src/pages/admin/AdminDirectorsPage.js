import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { getDirectors, addDirector, updateDirector, deleteDirector } from '../../services/otherServices';
import Modal from '../../components/common/Modal';
import { TableRowSkeleton } from '../../components/common/Skeletons';
import useApi from '../../hooks/useApi';
import { getFileUrl, getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminDirectorsPage = () => {
  const { data: directors, loading, refetch } = useApi(getDirectors);

  const [modal,   setModal]   = useState(null);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState({ directorName: '', directorPhoto: null });
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);

  const openAdd  = () => { setForm({ directorName: '', directorPhoto: null }); setErrors({}); setEditing(null); setModal('add'); };
  const openEdit = (d) => { setEditing(d); setForm({ directorName: d.directorName, directorPhoto: null }); setErrors({}); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (name === 'directorPhoto') setForm((f) => ({ ...f, directorPhoto: files[0] }));
    else setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  };

  const handleSave = async () => {
    if (!form.directorName.trim()) { setErrors({ directorName: 'Director name is required' }); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        const fd = new FormData();
        fd.append('directorName', form.directorName.trim());
        if (form.directorPhoto) fd.append('directorPhoto', form.directorPhoto);
        await addDirector(fd);
        toast.success('Director added!');
      } else {
        await updateDirector(editing._id, { directorName: form.directorName.trim() });
        toast.success('Director updated!');
      }
      refetch();
      closeModal();
    } catch (err) { toast.error(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this director?')) return;
    try {
      await deleteDirector(id);
      refetch();
      toast.success('Director deleted');
    } catch (err) { toast.error(getApiError(err)); }
  };

  return (
    <div>
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Music Directors</h1>
          <p className="page-subtitle">{directors?.length || 0} directors</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus size={15} /> Add Director</button>
      </div>

      <div className="table-wrap fade-in">
        <table className="data-table">
          <thead><tr><th>Photo</th><th>Director Name</th><th>Actions</th></tr></thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={3} />)
              : directors?.map((d) => (
                <tr key={d._id}>
                  <td>
                    {d.directorPhoto
                      ? <img src={getFileUrl(d.directorPhoto)} alt={d.directorName}
                          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiUser size={16} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    }
                  </td>
                  <td style={{ fontWeight: 500 }}>{d.directorName}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(d)}><FiEdit2 size={14} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(d._id)}
                        style={{ color: 'var(--accent-secondary)' }}><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!modal} onClose={closeModal} title={modal === 'add' ? 'Add Director' : 'Edit Director'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Director Name *</label>
            <input name="directorName" className={`form-input ${errors.directorName ? 'error' : ''}`}
              placeholder="Director full name" value={form.directorName} onChange={handleChange} autoFocus />
            {errors.directorName && <span className="form-error">{errors.directorName}</span>}
          </div>
          {modal === 'add' && (
            <div className="form-group">
              <label className="form-label">Photo (optional)</label>
              <input name="directorPhoto" type="file" accept="image/*" className="form-input"
                onChange={handleChange} style={{ padding: '8px 12px' }} />
            </div>
          )}
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

export default AdminDirectorsPage;
