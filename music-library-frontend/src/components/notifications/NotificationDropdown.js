import React, { useEffect, useRef } from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import { formatDate } from '../../utils/helpers';

const NotificationDropdown = ({ notifications, markRead, onClose }) => {
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="notif-dropdown" ref={ref}>
      <div className="notif-dropdown-header">
        <FiBell size={16} />
        <span>Notifications</span>
      </div>
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">No notifications yet</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`notif-item ${!n.isRead ? 'notif-unread' : ''}`}
            >
              <div className="notif-msg">{n.message}</div>
              <div className="notif-meta">
                <span>{formatDate(n.createdAt)}</span>
                {!n.isRead && (
                  <button
                    className="notif-read-btn"
                    onClick={() => markRead(n._id)}
                    title="Mark as read"
                  >
                    <FiCheck size={12} /> Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .notif-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 320px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-visible);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 500;
          overflow: hidden;
          animation: fadeInUp 0.2s ease;
        }
        .notif-dropdown-header {
          display: flex; align-items: center; gap: 8px;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-subtle);
          font-size: 13px; font-weight: 600;
          color: var(--text-secondary);
          font-family: var(--font-mono);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .notif-list {
          max-height: 360px;
          overflow-y: auto;
        }
        .notif-empty {
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
        }
        .notif-item {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-subtle);
          transition: background var(--transition-fast);
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: var(--bg-overlay); }
        .notif-unread { border-left: 3px solid var(--accent-primary); }
        .notif-msg { font-size: 13px; line-height: 1.5; margin-bottom: 4px; }
        .notif-meta {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 11px; color: var(--text-muted);
        }
        .notif-read-btn {
          background: none; border: none;
          color: var(--accent-primary);
          font-size: 11px; cursor: pointer;
          display: flex; align-items: center; gap: 4px;
          font-family: var(--font-mono);
        }
        .notif-read-btn:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
