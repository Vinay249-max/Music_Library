import React, { useState, useRef } from 'react';
import { FiCamera, FiUser, FiMail, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { uploadProfilePicture } from '../../services/authService';
import { getInitials, getFileUrl, getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handlePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePicture', file);
    setUploading(true);
    try {
      await uploadProfilePicture(formData);
      await refreshProfile();
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const fields = [
    { icon: FiUser,   label: 'Name',  value: user?.name  },
    { icon: FiMail,   label: 'Email', value: user?.email },
    { icon: FiShield, label: 'Role',  value: user?.role?.toUpperCase() },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="profile-layout">
        {/* Avatar */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrap">
            {user?.profilePicture ? (
              <img
                src={getFileUrl(user.profilePicture)}
                alt={user.name}
                className="profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {getInitials(user?.name)}
              </div>
            )}
            <button
              className="profile-avatar-btn"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              title="Change photo"
            >
              <FiCamera size={16} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePicChange}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              {user?.role?.toUpperCase()}
            </div>
          </div>
          {uploading && (
            <div style={{ fontSize: 12, color: 'var(--accent-primary)', marginTop: 8, textAlign: 'center' }}>
              Uploading…
            </div>
          )}
        </div>

        {/* Info */}
        <div className="profile-info-section">
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}>
            {fields.map(({ icon: Icon, label, value }) => (
              <div key={label} className="profile-row">
                <div className="profile-row-label">
                  <Icon size={14} /> {label}
                </div>
                <div className="profile-row-value">{value || '—'}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(232,255,71,0.05)',
            border: '1px solid rgba(232,255,71,0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginTop: 16,
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--accent-primary)' }}>Profile picture:</strong> Click the camera icon above to upload a new photo. Supported formats: JPG, PNG, WEBP.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .profile-layout {
          display: flex; gap: 48px; align-items: flex-start; flex-wrap: wrap;
        }
        .profile-avatar-section {
          display: flex; flex-direction: column; align-items: center;
          min-width: 200px;
        }
        .profile-avatar-wrap { position: relative; }
        .profile-avatar-img {
          width: 140px; height: 140px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--border-visible);
        }
        .profile-avatar-placeholder {
          width: 140px; height: 140px; border-radius: 50%;
          background: linear-gradient(135deg, var(--bg-elevated), var(--bg-overlay));
          border: 3px solid var(--border-visible);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 48px;
          color: var(--text-muted);
        }
        .profile-avatar-btn {
          position: absolute; bottom: 4px; right: 4px;
          width: 34px; height: 34px; border-radius: 50%;
          background: var(--accent-primary);
          color: var(--text-inverse);
          border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: transform var(--transition-fast);
        }
        .profile-avatar-btn:hover { transform: scale(1.1); }
        .profile-info-section { flex: 1; min-width: 260px; }
        .profile-row {
          display: flex; align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
          gap: 12px;
        }
        .profile-row:last-child { border-bottom: none; }
        .profile-row-label {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-mono);
          font-size: 11px; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--text-muted);
          width: 100px; flex-shrink: 0;
        }
        .profile-row-value { font-size: 15px; font-weight: 500; }
      `}</style>
    </div>
  );
};

export default ProfilePage;
