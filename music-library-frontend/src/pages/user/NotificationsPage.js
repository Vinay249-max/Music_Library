import React from 'react';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import useNotifications from '../../hooks/useNotifications';
import { formatDate } from '../../utils/helpers';
import { Skeleton } from '../../components/common/Skeletons';

const NotificationsPage = () => {
  const { notifications, loading, markRead } = useNotifications();

  const unread = notifications.filter((n) => !n.isRead);
  const read   = notifications.filter((n) => n.isRead);

  return (
    <div>
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unread.length > 0 ? `${unread.length} unread` : 'All caught up!'}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => unread.forEach((n) => markRead(n._id))}
          >
            <FiCheckCircle size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
            }}>
              <Skeleton height={14} width="70%" style={{ marginBottom: 8 }} />
              <Skeleton height={12} width="30%" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-state-icon">🔔</div>
          <div className="empty-state-title">No notifications</div>
          <p className="empty-state-text">You'll be notified when new songs are added to the library</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {unread.length > 0 && (
            <>
              <div className="notif-section-label">Unread</div>
              {unread.map((n) => (
                <NotifItem key={n._id} n={n} markRead={markRead} />
              ))}
            </>
          )}
          {read.length > 0 && (
            <>
              <div className="notif-section-label" style={{ marginTop: unread.length ? 20 : 0 }}>
                Read
              </div>
              {read.map((n) => (
                <NotifItem key={n._id} n={n} markRead={markRead} />
              ))}
            </>
          )}
        </div>
      )}

      <style>{`
        .notif-section-label {
          font-family: var(--font-mono);
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: var(--text-muted);
          padding: 4px 0;
        }
        .notif-full-item {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          display: flex; align-items: flex-start;
          gap: 14px;
          transition: background var(--transition-fast);
          animation: fadeInUp 0.3s ease both;
        }
        .notif-full-item.unread { border-left: 3px solid var(--accent-primary); }
        .notif-full-item:hover { background: var(--bg-elevated); }
        .notif-icon-wrap {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(232,255,71,0.1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .notif-body { flex: 1; }
        .notif-body-msg { font-size: 14px; margin-bottom: 4px; }
        .notif-body-date { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }
      `}</style>
    </div>
  );
};

const NotifItem = ({ n, markRead }) => (
  <div className={`notif-full-item ${!n.isRead ? 'unread' : ''}`}>
    <div className="notif-icon-wrap">
      <FiBell size={16} style={{ color: n.isRead ? 'var(--text-muted)' : 'var(--accent-primary)' }} />
    </div>
    <div className="notif-body">
      <div className="notif-body-msg">{n.message}</div>
      <div className="notif-body-date">{formatDate(n.createdAt)}</div>
    </div>
    {!n.isRead && (
      <button
        className="btn btn-ghost btn-icon btn-sm"
        onClick={() => markRead(n._id)}
        title="Mark as read"
        style={{ flexShrink: 0 }}
      >
        <FiCheck size={15} />
      </button>
    )}
  </div>
);

export default NotificationsPage;
