import { create } from 'zustand';
import { Theme } from '../types/ui.types';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('islamic_prayer_theme') as Theme;
    if (saved && (saved === 'dark' || saved === 'light')) {
      return saved;
    }
  }
  return 'dark';
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    set((state) => {
      const nextTheme: Theme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('islamic_prayer_theme', nextTheme);
      return { theme: nextTheme };
    });
  },
  setTheme: (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('islamic_prayer_theme', theme);
    set({ theme });
  },
}));
