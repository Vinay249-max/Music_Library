import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';

import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth pages
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User pages
import HomePage          from './pages/user/HomePage';
import SongsPage         from './pages/user/SongsPage';
import SongDetailPage    from './pages/user/SongDetailPage';
import SearchPage        from './pages/user/SearchPage';
import PlaylistsPage     from './pages/user/PlaylistsPage';
import PlaylistDetailPage from './pages/user/PlaylistDetailPage';
import NotificationsPage from './pages/user/NotificationsPage';
import ProfilePage       from './pages/user/ProfilePage';
import ArtistsPage       from './pages/user/ArtistsPage';
import ArtistDetailPage  from './pages/user/ArtistDetailPage';
import DirectorsPage     from './pages/user/DirectorsPage';
import DirectorDetailPage from './pages/user/DirectorDetailPage';

// Admin pages
import AdminDashboard        from './pages/admin/AdminDashboard';
import AdminSongsPage        from './pages/admin/AdminSongsPage';
import AdminArtistsPage      from './pages/admin/AdminArtistsPage';
import AdminDirectorsPage    from './pages/admin/AdminDirectorsPage';
import AdminAlbumsPage       from './pages/admin/AdminAlbumsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';

// Wrap a user page inside the shared layout + user-only guard
const UserPage = ({ children }) => (
  <ProtectedRoute userOnly>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

// Wrap an admin page inside the shared layout + admin-only guard
const AdminPage = ({ children }) => (
  <ProtectedRoute adminOnly>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <AuthProvider>
    <PlayerProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-visible)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: 'var(--accent-primary)', secondary: 'var(--text-inverse)' } },
            error:   { iconTheme: { primary: 'var(--accent-secondary)', secondary: '#fff' } },
            duration: 3500,
          }}
        />

        <Routes>
          {/* ── Public ─────────────────────────────────────── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── User routes ────────────────────────────────── */}
          <Route path="/home"             element={<UserPage><HomePage /></UserPage>} />
          <Route path="/songs"            element={<UserPage><SongsPage /></UserPage>} />
          <Route path="/songs/:id"        element={<UserPage><SongDetailPage /></UserPage>} />
          <Route path="/search"           element={<UserPage><SearchPage /></UserPage>} />
          <Route path="/playlists"        element={<UserPage><PlaylistsPage /></UserPage>} />
          <Route path="/playlists/:id"    element={<UserPage><PlaylistDetailPage /></UserPage>} />
          <Route path="/notifications"    element={<UserPage><NotificationsPage /></UserPage>} />
          <Route path="/profile"          element={<UserPage><ProfilePage /></UserPage>} />
          <Route path="/artists"          element={<UserPage><ArtistsPage /></UserPage>} />
          <Route path="/artists/:id"      element={<UserPage><ArtistDetailPage /></UserPage>} />
          <Route path="/directors"        element={<UserPage><DirectorsPage /></UserPage>} />
          <Route path="/directors/:id"    element={<UserPage><DirectorDetailPage /></UserPage>} />

          {/* ── Admin routes ───────────────────────────────── */}
          <Route path="/admin"                  element={<AdminPage><AdminDashboard /></AdminPage>} />
          <Route path="/admin/songs"            element={<AdminPage><AdminSongsPage /></AdminPage>} />
          <Route path="/admin/artists"          element={<AdminPage><AdminArtistsPage /></AdminPage>} />
          <Route path="/admin/directors"        element={<AdminPage><AdminDirectorsPage /></AdminPage>} />
          <Route path="/admin/albums"           element={<AdminPage><AdminAlbumsPage /></AdminPage>} />
          <Route path="/admin/notifications"    element={<AdminPage><AdminNotificationsPage /></AdminPage>} />
          <Route path="/admin/profile"          element={<AdminPage><ProfilePage /></AdminPage>} />

          {/* ── Fallback ───────────────────────────────────── */}
          <Route path="/"  element={<Navigate to="/login" replace />} />
          <Route path="*"  element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  </AuthProvider>
);

export default App;
