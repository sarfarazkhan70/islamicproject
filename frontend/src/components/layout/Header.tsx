import React, { useState, useEffect } from 'react';
import { Sun, Moon, Bell, MapPin, Compass, RefreshCw, Calendar } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useLocationStore } from '../../stores/useLocationStore';
import { getCurrentHijriDate } from '../../utils/hijriCalendar.js';
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
  const [hijriDateStr, setHijriDateStr] = useState(getCurrentHijriDate().formatted);

  // Keep live Hijri date updated
  useEffect(() => {
    const updateDate = () => setHijriDateStr(getCurrentHijriDate().formatted);
    const interval = setInterval(updateDate, 30000);
    return () => clearInterval(interval);
  }, []);

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
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-logo" style={{ width: 32, height: 32 }}>
              <img src="/favicon.svg" alt="Logo" width={22} height={22} />
            </div>
            <span className="brand-title" style={{ fontSize: 'var(--text-base)' }}>
              Islamic Prayer
            </span>
          </Link>
        </div>

        <div className="header-right">
          {/* Central Live Hijri Date Pill */}
          <Link
            to="/calendar"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '5px 12px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            title="View Islamic Calendar"
          >
            <Calendar size={12} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
            <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-gold)', whiteSpace: 'nowrap' }}>
              {hijriDateStr}
            </span>
          </Link>

          {/* Location & Madhhab Pill */}
          <button

            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '5px 12px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              maxWidth: 320,
              transition: 'all 0.15s ease',
            }}
            title="Click to change or refresh your location"
          >
            {isDetecting ? (
              <RefreshCw size={12} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
            ) : (
              <MapPin size={12} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
            )}
            <span
              style={{
                fontWeight: 'var(--weight-medium)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 180,
              }}
            >
              {locationDisplayText}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <Compass size={12} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
            <span style={{ textTransform: 'capitalize', color: 'var(--text-gold)', flexShrink: 0 }}>
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



