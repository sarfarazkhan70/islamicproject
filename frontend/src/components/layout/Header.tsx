import React, { useState } from 'react';
import { Sun, Moon, Bell, MapPin, Compass, RefreshCw, Calendar } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useLocationStore } from '../../stores/useLocationStore';
import { useCentralHijriDate } from '../../hooks/useCentralHijriDate.js';
import { LocationPickerModal } from '../common/LocationPickerModal';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { madhhab } = useSettingsStore();
  const {
    city,
    displayName,
    status,
    permissionStatus,
  } = useLocationStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const centralHijri = useCentralHijriDate();
  const hijriDateStr = centralHijri.formatted;

  const isDetecting = status === 'detecting';
  const isUnavailable = permissionStatus === 'denied' && !city;

  const locationDisplayText = isDetecting
    ? 'Detecting location...'
    : isUnavailable
    ? 'Location unavailable'
    : displayName || city || 'Select Location';


  return (
    <>
      <header className="top-header">
        <div className="header-left">
          <Link to="/" className="header-brand-link">
            <div className="brand-logo header-brand-logo">
              <img src="/favicon.svg" alt="Islamic Project Logo" width={28} height={28} />
            </div>
            <span className="brand-title header-brand-title">
              <span className="brand-text-islamic">Islamic</span>
              <span className="brand-text-project">Project</span>
            </span>
          </Link>
        </div>

        <div className="header-right">
          {/* Central Live Hijri Date Pill */}
          <Link
            to="/calendar"
            className="header-date-pill"
            title="View Islamic Calendar"
          >
            <Calendar size={13} className="header-pill-icon text-gold" style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
            <span className="header-date-text">
              {hijriDateStr}
            </span>
          </Link>

          {/* Location & Madhhab Pill */}
          <button
            className="header-location-pill"
            onClick={() => setIsModalOpen(true)}
            title="Click to change or refresh your location"
          >
            {isDetecting ? (
              <RefreshCw size={13} className="animate-spin header-pill-icon" style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
            ) : (
              <MapPin size={13} className="header-pill-icon" style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
            )}
            <span className="header-location-text">
              {locationDisplayText}
            </span>
            <span className="header-pill-divider" style={{ color: 'var(--text-muted)' }}>•</span>
            <Compass size={13} className="header-pill-icon header-madhhab-icon" style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
            <span className="header-madhhab-text" style={{ textTransform: 'capitalize', color: 'var(--text-gold)', flexShrink: 0 }}>
              {madhhab}
            </span>
          </button>

          <Link
            to="/notifications"
            className="btn-icon btn-icon-sm"
            aria-label="Notifications"
            title="Notifications & Reminders"
          >
            <Bell size={16} />
          </Link>

          <button
            className="btn-icon btn-icon-sm"
            onClick={toggleTheme}
            aria-label={`Toggle theme (currently ${theme})`}
            title={`Toggle theme (currently ${theme})`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Global Location Picker Modal */}
      <LocationPickerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};



