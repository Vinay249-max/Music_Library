import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome, FiMusic, FiSearch, FiList, FiBell,
  FiUser, FiShield, FiSettings, FiDisc
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const userLinks = [
  { to: '/home',       icon: FiHome,   label: 'Home' },
  { to: '/songs',      icon: FiMusic,  label: 'Library' },
  { to: '/artists',    icon: FiDisc,   label: 'Artists' },
  { to: '/directors',  icon: FiSettings, label: 'Directors' },
  { to: '/search',     icon: FiSearch, label: 'Search' },
  { to: '/playlists',  icon: FiList,   label: 'Playlists' },
  { to: '/notifications', icon: FiBell, label: 'Notifications' },
  { to: '/profile',    icon: FiUser,   label: 'Profile' },
];

const adminLinks = [
  { to: '/admin',         icon: FiShield, label: 'Dashboard' },
  { to: '/admin/songs',   icon: FiMusic,  label: 'Songs' },
  { to: '/admin/artists', icon: FiDisc,   label: 'Artists' },
  { to: '/admin/directors', icon: FiSettings, label: 'Directors' },
  { to: '/admin/albums',  icon: FiList,   label: 'Albums' },
  { to: '/admin/notifications', icon: FiBell, label: 'Notifications' },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 150,
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-section-label">
          {isAdmin ? 'ADMIN' : 'NAVIGATION'}
        </div>
        <nav className="sidebar-nav">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin' || to === '/home'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-version">MELODIA v1.0</span>
        </div>
      </aside>

      <style>{`
        .sidebar {
          position: fixed;
          top: var(--navbar-height);
          left: 0;
          width: var(--sidebar-width);
          height: calc(100vh - var(--navbar-height));
          background: var(--bg-surface);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          z-index: 100;
          overflow-y: auto;
          transition: transform var(--transition-slow);
        }
        .sidebar-section-label {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          padding: 0 20px 12px;
        }
        .sidebar-nav { display: flex; flex-direction: column; gap: 2px; padding: 0 10px; }
        .sidebar-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: all var(--transition-fast);
        }
        .sidebar-link:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }
        .sidebar-link.active {
          background: rgba(232,255,71,0.1);
          color: var(--accent-primary);
        }
        .sidebar-link.active svg { color: var(--accent-primary); }
        .sidebar-footer {
          margin-top: auto;
          padding: 16px 20px 0;
        }
        .sidebar-version {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
        }
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            z-index: 160;
          }
          .sidebar.sidebar-open { transform: translateX(0); }
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
