import { create } from 'zustand';
import {
  AZKAR_CATEGORIES,
  AZKAR_ITEMS,
  AzkarCategoryMeta,
  AzkarItem,
} from '../data/azkarData.js';

interface AzkarState {
  categories: AzkarCategoryMeta[];
  items: AzkarItem[];
  selectedCategory: string;
  favorites: string[];
  counters: Record<string, number>;
  digitalTasbeehCount: number;
  digitalTasbeehTarget: number;
  searchTerm: string;

  // Actions
  setSelectedCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;
  incrementCounter: (azkarId: string, maxTarget?: number) => void;
  resetCounter: (azkarId: string) => void;
  incrementTasbeeh: () => void;
  resetTasbeeh: () => void;
  setTasbeehTarget: (target: number) => void;
  toggleFavorite: (azkarId: string) => Promise<void>;
}

const LOCAL_AZKAR_FAVORITES_KEY = 'islamic_prayer_azkar_favorites';
const LOCAL_AZKAR_COUNTERS_KEY = 'islamic_prayer_azkar_counters';
const LOCAL_TASBEEH_COUNT_KEY = 'islamic_prayer_tasbeeh_count';

function getStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_AZKAR_FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ['azkar-m-1', 'azkar-m-4', 'azkar-s-2'];
  } catch {
    return ['azkar-m-1'];
  }
}

function getStoredCounters(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LOCAL_AZKAR_COUNTERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export const useAzkarStore = create<AzkarState>((set, get) => ({
  categories: AZKAR_CATEGORIES,
  items: AZKAR_ITEMS,
  selectedCategory: 'morning',
  favorites: getStoredFavorites(),
  counters: getStoredCounters(),
  digitalTasbeehCount: Number(localStorage.getItem(LOCAL_TASBEEH_COUNT_KEY) || 0),
  digitalTasbeehTarget: 33,
  searchTerm: '',

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
  },

  incrementCounter: (azkarId: string, maxTarget?: number) => {
    const { counters } = get();
    const current = counters[azkarId] || 0;
    const next = maxTarget && current >= maxTarget ? maxTarget : current + 1;

    // Optional haptic vibration feedback on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // Safe fallback
      }
    }

    const updated = { ...counters, [azkarId]: next };
    set({ counters: updated });
    localStorage.setItem(LOCAL_AZKAR_COUNTERS_KEY, JSON.stringify(updated));
  },

  resetCounter: (azkarId: string) => {
    const { counters } = get();
    const updated = { ...counters, [azkarId]: 0 };
    set({ counters: updated });
    localStorage.setItem(LOCAL_AZKAR_COUNTERS_KEY, JSON.stringify(updated));
  },

  incrementTasbeeh: () => {
    const next = get().digitalTasbeehCount + 1;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // Safe fallback
      }
    }
    set({ digitalTasbeehCount: next });
    localStorage.setItem(LOCAL_TASBEEH_COUNT_KEY, String(next));
  },

  resetTasbeeh: () => {
    set({ digitalTasbeehCount: 0 });
    localStorage.setItem(LOCAL_TASBEEH_COUNT_KEY, '0');
  },

  setTasbeehTarget: (target: number) => {
    set({ digitalTasbeehTarget: target });
  },

  toggleFavorite: async (azkarId: string) => {
    const { favorites } = get();
    const isFav = favorites.includes(azkarId);
    const updated = isFav ? favorites.filter((id) => id !== azkarId) : [...favorites, azkarId];

    set({ favorites: updated });
    localStorage.setItem(LOCAL_AZKAR_FAVORITES_KEY, JSON.stringify(updated));

    // Try backend sync if authenticated
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/v1/azkar/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ azkarId }),
        });
      }
    } catch {
      // Local fallback
    }
  },
}));
