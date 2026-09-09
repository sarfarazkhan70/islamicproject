import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';

// Application Page components
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { PrayerTimesPage } from '../pages/PrayerTimes/PrayerTimesPage';
import { TrackerPage } from '../pages/Tracker/TrackerPage';
import { QazaPage } from '../pages/Qaza/QazaPage';
import { HistoryPage } from '../pages/History/HistoryPage';
import { NotificationsPage } from '../pages/Notifications/NotificationsPage';
import { SurahAlMulkPage } from '../pages/SurahAlMulk/SurahAlMulkPage';
import { QuranPage } from '../pages/Quran/QuranPage';
import { AzkarPage } from '../pages/Azkar/AzkarPage';
import { QiblaPage } from '../pages/Qibla/QiblaPage';
import { CalendarPage } from '../pages/Calendar/CalendarPage';
import { RamadanPage } from '../pages/Ramadan/RamadanPage';
import { JumuahPage } from '../pages/Jumuah/JumuahPage';
import { AsmaUlHusnaPage } from '../pages/Names/AsmaUlHusnaPage';
import { AsmaEMustafaPage } from '../pages/Names/AsmaEMustafaPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';
import { LibraryPage } from '../pages/Library/LibraryPage';
import { BookDetailPage } from '../pages/Library/BookDetailPage';
import { BookReaderPage } from '../pages/Library/BookReaderPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Primary Navigation Routes */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/prayer-times" element={<PrayerTimesPage />} />
        <Route path="/tracker" element={<TrackerPage />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/:bookId" element={<BookDetailPage />} />
        <Route path="/library/:bookId/read" element={<BookReaderPage />} />
        <Route path="/books" element={<Navigate to="/library" replace />} />
        <Route path="/hadith" element={<Navigate to="/library" replace />} />
        <Route path="/azkar" element={<AzkarPage />} />
        <Route path="/duas" element={<Navigate to="/azkar" replace />} />
        <Route path="/dua" element={<Navigate to="/azkar" replace />} />
        <Route path="/qibla" element={<QiblaPage />} />

        {/* Dedicated Islamic Names Routes */}
        <Route path="/allah-names" element={<AsmaUlHusnaPage />} />
        <Route path="/asma-ul-husna" element={<Navigate to="/allah-names" replace />} />
        <Route path="/prophet-names" element={<AsmaEMustafaPage />} />
        <Route path="/asma-e-mustafa" element={<Navigate to="/prophet-names" replace />} />

        {/* Secondary / Feature Routes */}
        <Route path="/qaza" element={<QazaPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/surah-al-mulk" element={<SurahAlMulkPage />} />
        <Route path="/surah-mulk" element={<Navigate to="/surah-al-mulk" replace />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/ramadan" element={<RamadanPage />} />
        <Route path="/jumuah" element={<JumuahPage />} />
        <Route path="/settings" element={<SettingsPage />} />


        {/* Catch-all redirect to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};


