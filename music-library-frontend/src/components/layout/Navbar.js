import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiLogOut, FiMenu, FiX, FiMusic } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import useNotifications from '../../hooks/useNotifications';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { getInitials, getFileUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Navbar = ({ onMenuToggle, menuOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount, notifications, markRead } = useNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const homeLink = isAdmin ? '/admin' : '/home';

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button className="btn btn-ghost btn-icon show-mobile" onClick={onMenuToggle}>
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <Link to={homeLink} className="navbar-brand">
            <FiMusic size={22} style={{ color: 'var(--accent-primary)' }} />
            <span>MELODIA</span>
          </Link>
        </div>

        <div className="navbar-right">
          {/* Notification bell */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setShowNotif((v) => !v)}
              style={{ position: 'relative' }}
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            {showNotif && (
              <NotificationDropdown
                notifications={notifications}
                markRead={markRead}
                onClose={() => setShowNotif(false)}
              />
            )}
          </div>

          {/* User avatar + name */}
          <Link
            to={isAdmin ? '/admin/profile' : '/profile'}
            className="navbar-user"
          >
            {user?.profilePicture ? (
              <img
                src={getFileUrl(user.profilePicture)}
                alt={user.name}
                className="avatar-img"
              />
            ) : (
              <div className="avatar-placeholder">{getInitials(user?.name)}</div>
            )}
            <span className="navbar-username hide-mobile">{user?.name}</span>
          </Link>

          <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout">
            <FiLogOut size={18} />
          </button>
        </div>
      </nav>

      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: var(--navbar-height);
          background: rgba(10, 10, 15, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          z-index: 200;
        }
        .navbar-left { display: flex; align-items: center; gap: 12px; }
        .navbar-right { display: flex; align-items: center; gap: 8px; }
        .navbar-brand {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--font-display);
          font-size: 22px;
          letter-spacing: 0.1em;
          color: var(--text-primary);
        }
        .navbar-user {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 10px 4px 4px;
          border-radius: var(--radius-full);
          background: var(--bg-elevated);
          transition: background var(--transition-fast);
        }
        .navbar-user:hover { background: var(--bg-overlay); }
        .navbar-username { font-size: 14px; font-weight: 500; }
        .avatar-img {
          width: 30px; height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }
        .avatar-placeholder {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: var(--accent-primary);
          color: var(--text-inverse);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          font-family: var(--font-mono);
        }
        .notif-badge {
          position: absolute;
          top: 2px; right: 2px;
          background: var(--accent-secondary);
          color: #fff;
          font-size: 10px; font-weight: 700;
          width: 16px; height: 16px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          line-height: 1;
        }
        .show-mobile { display: none; }
        @media (max-width: 768px) {
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
