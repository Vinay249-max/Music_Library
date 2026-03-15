import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AudioPlayer from '../songs/AudioPlayer';

const AppLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      <Navbar
        onMenuToggle={() => setMobileMenuOpen((v) => !v)}
        menuOpen={mobileMenuOpen}
      />
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main className="app-main">
        <div className="app-content">
          {children}
        </div>
      </main>
      <AudioPlayer />

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          padding-top: var(--navbar-height);
        }
        .app-main {
          margin-left: var(--sidebar-width);
          flex: 1;
          min-width: 0;
          padding-bottom: 100px; /* space for audio player */
        }
        .app-content {
          padding: 32px 32px;
          max-width: 1300px;
        }
        @media (max-width: 768px) {
          .app-main { margin-left: 0; }
          .app-content { padding: 20px 16px; }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
