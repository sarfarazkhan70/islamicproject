import React from 'react';
import { Sun, Moon, Bell, MapPin, Compass } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { location, madhhab } = useSettingsStore();

  return (
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '4px 10px',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <MapPin size={12} style={{ color: 'var(--brand-primary)' }} />
          <span style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
            {location.city}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <Compass size={12} style={{ color: 'var(--brand-gold)' }} />
          <span style={{ textTransform: 'capitalize', color: 'var(--text-gold)' }}>
            {madhhab}
          </span>
        </div>

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
  );
};


