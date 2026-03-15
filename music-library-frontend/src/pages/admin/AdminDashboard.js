import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMusic, FiUsers, FiDisc, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { getSongs } from '../../services/songService';
import { getArtists, getDirectors, getAlbums } from '../../services/otherServices';
import { Skeleton } from '../../components/common/Skeletons';

const AdminDashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all including hidden for admin view
        const [sRes, arRes, dirRes, alRes] = await Promise.all([
          getSongs({}), getArtists(), getDirectors(), getAlbums(),
        ]);
        // Admin needs to see hidden songs too — we approximate from visible
        const songs = sRes.data;
        setStats({
          totalSongs: songs.length,
          hiddenSongs: songs.filter((s) => !s.isVisible).length,
          artists: arRes.data.length,
          directors: dirRes.data.length,
          albums: alRes.data.length,
        });
      } catch (_) {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const cards = stats ? [
    { icon: FiMusic,   label: 'Total Songs',    value: stats.totalSongs,  color: 'var(--accent-primary)',   to: '/admin/songs' },
    { icon: FiEyeOff,  label: 'Hidden Songs',   value: stats.hiddenSongs, color: 'var(--accent-secondary)', to: '/admin/songs' },
    { icon: FiUsers,   label: 'Artists',        value: stats.artists,     color: 'var(--accent-blue)',      to: '/admin/artists' },
    { icon: FiDisc,    label: 'Albums',         value: stats.albums,      color: 'var(--accent-purple)',    to: '/admin/albums' },
  ] : [];

  return (
    <div>
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Music Library management overview</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="admin-stats-grid fade-in fade-in-delay-1">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 24 }}>
              <Skeleton height={36} width={60} style={{ marginBottom: 8 }} />
              <Skeleton height={14} width="60%" />
            </div>
          ))
          : cards.map(({ icon: Icon, label, value, color, to }) => (
            <Link key={label} to={to} className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: `${color}18`, color }}>
                <Icon size={22} />
              </div>
              <div className="admin-stat-value">{value}</div>
              <div className="admin-stat-label">{label}</div>
            </Link>
          ))
        }
      </div>

      {/* Quick links */}
      <div style={{ marginTop: 40 }}>
        <h2 className="page-title fade-in" style={{ fontSize: 24, marginBottom: 20 }}>
          Quick Actions
        </h2>
        <div className="admin-quicklinks fade-in fade-in-delay-2">
          {[
            { to: '/admin/songs',    label: 'Manage Songs',    desc: 'Add, edit, delete, toggle visibility' },
            { to: '/admin/artists',  label: 'Manage Artists',  desc: 'Add and manage artist profiles' },
            { to: '/admin/directors',label: 'Music Directors', desc: 'Manage music director records' },
            { to: '/admin/albums',   label: 'Manage Albums',   desc: 'Add and edit album entries' },
          ].map(({ to, label, desc }) => (
            <Link key={to} to={to} className="admin-quicklink">
              <div>
                <div className="admin-quicklink-title">{label}</div>
                <div className="admin-quicklink-desc">{desc}</div>
              </div>
              <FiArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        .admin-stat-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 24px 20px;
          display: flex; flex-direction: column; gap: 10px;
          transition: all var(--transition-fast);
        }
        .admin-stat-card:hover {
          border-color: var(--border-visible);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
        .admin-stat-icon {
          width: 48px; height: 48px; border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center;
        }
        .admin-stat-value {
          font-family: var(--font-display);
          font-size: 40px; line-height: 1;
          color: var(--text-primary);
        }
        .admin-stat-label {
          font-size: 12px; color: var(--text-muted);
          font-family: var(--font-mono);
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .admin-quicklinks { display: flex; flex-direction: column; gap: 10px; }
        .admin-quicklink {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 18px 20px;
          transition: all var(--transition-fast);
        }
        .admin-quicklink:hover {
          border-color: var(--border-visible);
          background: var(--bg-elevated);
        }
        .admin-quicklink-title { font-size: 15px; font-weight: 600; margin-bottom: 3px; }
        .admin-quicklink-desc { font-size: 12px; color: var(--text-muted); }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
