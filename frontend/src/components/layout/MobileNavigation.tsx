import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Clock,
  CheckSquare,
  BookOpen,
  Menu,
  X,
  RotateCcw,
  BarChart3,
  Bell,
  Moon,
  Calendar,
  Sparkles,
  Users,
  Settings,
  Heart,
  Compass,
  Library,
} from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();

  const mainTabs = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/prayer-times', label: 'Prayers', icon: Clock },
    { path: '/tracker', label: 'Namaz Tracker', icon: CheckSquare },
    { path: '/quran', label: 'Quran', icon: BookOpen },
  ];

  const secondaryTabs = [
    { path: '/tracker', label: 'Namaz Tracker', icon: CheckSquare, desc: 'Daily prayers, Ada, Missed & Safar tracker' },
    { path: '/library', label: 'Islamic Library', icon: Library, desc: 'Hadith, Fiqh & Alahazrat Books' },
    { path: '/allah-names', label: 'Asma-ul-Husna', icon: Sparkles, desc: '99 Names of Allah Ta’ala' },
    { path: '/prophet-names', label: 'Asma-e-Mustafa ﷺ', icon: Heart, desc: 'Verified Prophetic Names' },
    { path: '/azkar', label: 'Azkar & Duas', icon: Heart, desc: 'Daily authentic prayers' },
    { path: '/qibla', label: 'Qibla Finder', icon: Compass, desc: 'Kaaba compass direction' },
    { path: '/surah-al-mulk', label: 'Surah Al-Mulk', icon: Moon, desc: 'Sleep audio recitation' },
    { path: '/calendar', label: 'Islamic Calendar', icon: Calendar, desc: 'Hijri & sacred events' },
    { path: '/ramadan', label: 'Ramadan', icon: Sparkles, desc: 'Sehri, Iftar & fast log' },
    { path: '/jumuah', label: "Jumu'ah Portal", icon: Users, desc: 'Kahf & Friday sunnahs' },
    { path: '/qaza', label: 'Qaza Namaz', icon: RotateCcw, desc: 'Lifetime missed prayer log' },
    { path: '/history', label: 'Prayer History', icon: BarChart3, desc: 'Streak & analytics' },
    { path: '/notifications', label: 'Notifications', icon: Bell, desc: 'Adhans & custom alerts' },
    { path: '/settings', label: 'Settings', icon: Settings, desc: 'Preferences & location' },
  ];


  const isMoreActive = secondaryTabs.some((tab) => tab.path === location.pathname);

  return (
    <>
      <nav className="mobile-nav-bar" aria-label="Mobile Navigation">
        <div className="mobile-nav-items">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}
                end={tab.path === '/'}
              >
                <Icon />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}

          <button
            className={`mobile-nav-btn ${isMoreActive || isDrawerOpen ? 'active' : ''}`}
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            aria-label="More Features"
          >
            <Menu />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Slide-Up Drawer Backdrop */}
      <div
        className={`drawer-backdrop ${isDrawerOpen ? 'open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Slide-Up Drawer Content */}
      <div className={`drawer-content ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-handle" />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h3 className="heading-3">More Features</h3>
          <button
            className="btn-icon btn-icon-sm"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-2)' }}>
          {secondaryTabs.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsDrawerOpen(false)}
                className={`card card-compact ${isActive ? 'card-highlight' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderColor: isActive ? 'var(--brand-primary)' : 'var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive
                      ? 'var(--brand-primary)'
                      : 'var(--bg-surface-elevated)',
                    color: isActive ? '#fff' : 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 'var(--weight-semibold)',
                      color: isActive ? 'var(--brand-primary)' : 'var(--text-primary)',
                    }}
                  >
                    {item.label}
                  </div>
                  <div className="text-xs text-muted">{item.desc}</div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
};
