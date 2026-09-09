import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Clock,
  CheckSquare,
  BookOpen,
  Library,
  Heart,
  Compass,
  RotateCcw,
  BarChart3,
  Bell,
  Moon,
  Calendar,
  Sparkles,
  Users,
  Settings,
  Sun,
} from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';

export const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  const primaryNav = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/prayer-times', label: 'Prayer Times', icon: Clock },
    { path: '/tracker', label: 'Namaz Tracker', icon: CheckSquare },
    { path: '/quran', label: 'Quran', icon: BookOpen },
    { path: '/library', label: 'Islamic Library', icon: Library, badge: 'Hadith & Fiqh' },
    { path: '/azkar', label: 'Azkar & Duas', icon: Heart },
    { path: '/qibla', label: 'Qibla Finder', icon: Compass },
  ];

  const secondaryNav = [
    { path: '/allah-names', label: 'Asma-ul-Husna', icon: Sparkles, badge: '99 Names' },
    { path: '/prophet-names', label: 'Asma-e-Mustafa', icon: Heart, badge: 'ﷺ' },
    { path: '/surah-al-mulk', label: 'Surah Al-Mulk', icon: Moon, badge: 'Sleep' },
    { path: '/calendar', label: 'Islamic Calendar', icon: Calendar },
    { path: '/ramadan', label: 'Ramadan', icon: Sparkles },
    { path: '/jumuah', label: "Jumu'ah", icon: Users },
    { path: '/qaza', label: 'Qaza Namaz', icon: RotateCcw },
    { path: '/history', label: 'Prayer History', icon: BarChart3 },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];


  return (
    <aside className="sidebar" aria-label="Main Navigation">
      <div className="sidebar-header">
        <div className="brand-logo">
          <img src="/favicon.svg" alt="Islamic Project Logo" width={36} height={36} />
        </div>
        <div>
          <h1 className="brand-title">
            <span className="brand-text-islamic">Islamic</span>
            <span className="brand-text-project">Project</span>
          </h1>
          <span className="brand-subtitle">Daily Companion</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">Daily Practice</span>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="nav-section">
          <span className="nav-section-title">Companion & Features</span>
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      borderRadius: 10,
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--brand-gold)',
                      fontWeight: 'var(--weight-semibold)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="sidebar-footer">
        <span className="text-xs text-muted">v1.0.0 • Phase 1</span>
        <button
          className="btn-icon btn-icon-sm"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </aside>
  );
};
