import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { GlobalQuranAudioController } from '../quran/GlobalQuranAudioController';
import { GlobalMiniQuranPlayer } from '../quran/GlobalMiniQuranPlayer';
import { GlobalMiniKanzulImanPlayer } from '../quran/GlobalMiniKanzulImanPlayer';

export const AppShell: React.FC = () => {
  return (
    <div className="app-shell">
      {/* Global Persistent Quran Audio Controller */}
      <GlobalQuranAudioController />

      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header />
        <main className="content-container">
          <Outlet />
        </main>
      </div>

      {/* Global Mini Quran Player (floating when navigated away from /quran) */}
      <GlobalMiniQuranPlayer />

      {/* Global Mini Kanz-ul-Iman Player (floating persistent player) */}
      <GlobalMiniKanzulImanPlayer />

      {/* Mobile Bottom Navigation Bar & Drawer */}
      <MobileNavigation />
    </div>
  );
};
