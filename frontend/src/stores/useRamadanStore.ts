import { create } from 'zustand';
import { getCentralHijriDate } from '../utils/hijriCalendar.js';


export type FastingStatus = 'FASTED' | 'MISSED' | 'EXCUSED' | 'QAZA' | 'NONE';

interface RamadanState {
  isRamadan: boolean;
  currentHijriYear: number;
  currentRamadanDay: number;
  fastingRecords: Record<string, FastingStatus>;
  completedJuz: number[];

  // Actions
  refreshDate: () => void;
  logFast: (localDate: string, status: FastingStatus, ramadanDay: number) => Promise<void>;
  toggleJuz: (juzNumber: number) => Promise<void>;
  getFastingStatus: (localDate: string) => FastingStatus;
}

const LOCAL_FASTING_KEY = 'islamic_prayer_ramadan_fasts';
const LOCAL_KHATAM_KEY = 'islamic_prayer_ramadan_khatam';

function getStoredFasting(): Record<string, FastingStatus> {
  try {
    const raw = localStorage.getItem(LOCAL_FASTING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getStoredKhatam(): number[] {
  try {
    const raw = localStorage.getItem(LOCAL_KHATAM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const todayHijri = getCentralHijriDate();
const isCurrentlyRamadan = todayHijri.month === 9;

export const useRamadanStore = create<RamadanState>((set, get) => ({
  isRamadan: isCurrentlyRamadan,
  currentHijriYear: todayHijri.year,
  currentRamadanDay: isCurrentlyRamadan ? todayHijri.day : 1,
  fastingRecords: getStoredFasting(),
  completedJuz: getStoredKhatam(),

  refreshDate: () => {
    const freshToday = getCentralHijriDate();
    const inRamadan = freshToday.month === 9;
    set({
      isRamadan: inRamadan,
      currentHijriYear: freshToday.year,
      currentRamadanDay: inRamadan ? freshToday.day : 1,
    });
  },


  getFastingStatus: (localDate: string) => {
    return get().fastingRecords[localDate] || 'NONE';
  },

  logFast: async (localDate: string, status: FastingStatus, ramadanDay: number) => {
    const { fastingRecords, currentHijriYear } = get();
    const updated = { ...fastingRecords, [localDate]: status };

    set({ fastingRecords: updated });
    localStorage.setItem(LOCAL_FASTING_KEY, JSON.stringify(updated));

    // Try backend sync if authenticated
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/v1/ramadan/fasting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            localDate,
            hijriYear: currentHijriYear,
            ramadanDay,
            status,
          }),
        });
      }
    } catch {
      // Local fallback
    }
  },

  toggleJuz: async (juzNumber: number) => {
    const { completedJuz, currentHijriYear } = get();
    const isCompleted = completedJuz.includes(juzNumber);
    const updated = isCompleted
      ? completedJuz.filter((j) => j !== juzNumber)
      : [...completedJuz, juzNumber].sort((a, b) => a - b);

    set({ completedJuz: updated });
    localStorage.setItem(LOCAL_KHATAM_KEY, JSON.stringify(updated));

    // Try backend sync if authenticated
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/v1/ramadan/khatam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            hijriYear: currentHijriYear,
            completedJuz: updated,
          }),
        });
      }
    } catch {
      // Local fallback
    }
  },
}));
