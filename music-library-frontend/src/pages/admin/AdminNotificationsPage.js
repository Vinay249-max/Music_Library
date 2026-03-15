import React from 'react';
import { FiBell } from 'react-icons/fi';
import useNotifications from '../../hooks/useNotifications';
import { formatDate } from '../../utils/helpers';
import { Skeleton } from '../../components/common/Skeletons';

const AdminNotificationsPage = () => {
  const { notifications, loading } = useNotifications();

  return (
    <div>
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Sent Notifications</h1>
          <p className="page-subtitle">Auto-generated when songs are added</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
              <Skeleton height={14} width="60%" style={{ marginBottom: 8 }} />
              <Skeleton height={11} width="25%" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-state-icon">🔔</div>
          <div className="empty-state-title">No notifications</div>
          <p className="empty-state-text">Notifications are automatically sent to all users when you add a new song.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n) => (
            <div key={n._id} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <FiBell size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14 }}>{n.message}</div>
                {n.songId && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    Song: {n.songId.songName}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                {formatDate(n.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsPage;
