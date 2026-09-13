import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Namaz Tracker Navigation & Menu Visibility', () => {
  const sidebarPath = path.resolve(__dirname, '../components/layout/Sidebar.tsx');
  const mobileNavPath = path.resolve(__dirname, '../components/layout/MobileNavigation.tsx');
  const appRoutesPath = path.resolve(__dirname, '../routes/AppRoutes.tsx');
  const layoutCssPath = path.resolve(__dirname, '../styles/layout.css');

  it('1. Desktop Sidebar contains Namaz Tracker with exact label spelling, path /tracker, and CheckSquare icon', () => {
    const sidebarCode = fs.readFileSync(sidebarPath, 'utf-8');
    expect(sidebarCode).toContain("path: '/tracker'");
    expect(sidebarCode).toContain("label: 'Namaz Tracker'");
    expect(sidebarCode).toContain('icon: CheckSquare');
    // Ensure spelling is exact "Namaz Tracker"
    expect(sidebarCode).not.toContain("label: 'Tracker'");
  });

  it('2. Mobile Bottom Navigation contains Namaz Tracker in mainTabs with path /tracker and exact spelling', () => {
    const mobileNavCode = fs.readFileSync(mobileNavPath, 'utf-8');
    expect(mobileNavCode).toContain("path: '/tracker', label: 'Namaz Tracker', icon: CheckSquare");
    // Ensure it is not abbreviated to just 'Tracker' in mainTabs
    expect(mobileNavCode).not.toMatch(/mainTabs\s*=\s*\[[^\]]*label:\s*'Tracker'/);
  });

  it('3. Mobile Hamburger / More Drawer contains Namaz Tracker in secondaryTabs', () => {
    const mobileNavCode = fs.readFileSync(mobileNavPath, 'utf-8');
    // Ensure secondaryTabs includes Namaz Tracker
    expect(mobileNavCode).toMatch(/secondaryTabs\s*=\s*\[[\s\S]*path:\s*'\/tracker'[\s\S]*label:\s*'Namaz Tracker'/);
  });

  it('4. AppRoutes defines /tracker mapped to <TrackerPage /> and is always accessible', () => {
    const appRoutesCode = fs.readFileSync(appRoutesPath, 'utf-8');
    expect(appRoutesCode).toContain('TrackerPage');
    expect(appRoutesCode).toContain('<Route path="/tracker" element={<TrackerPage />} />');
  });

  it('5. Responsive layout CSS ensures mobile navigation and buttons are properly structured', () => {
    const layoutCss = fs.readFileSync(layoutCssPath, 'utf-8');
    expect(layoutCss).toContain('.mobile-nav-bar');
    expect(layoutCss).toContain('.mobile-nav-btn');
    expect(layoutCss).toContain('.mobile-nav-btn span');
    expect(layoutCss).toContain('.mobile-nav-items');
  });
});
