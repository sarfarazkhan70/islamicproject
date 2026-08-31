import { create } from 'zustand';

export type TrackerStatus = 'ADA' | 'MISSED' | 'EXCUSED' | 'QAZA' | 'NONE';

export type TrackablePrayer =
  | 'fajr'
  | 'zuhr'
  | 'asr'
  | 'maghrib'
  | 'isha'
  | 'witr'
  | 'tahajjud'
  | 'duha'
  | 'ishraq';

export interface QazaSummaryState {
  fajr: number;
  zuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
  dailyTarget: number;
  totalCompleted: number;
}

export interface QazaLogEntry {
  id: string;
  prayer: string;
  quantity: number;
  completedAt: string;
  localDate: string;
}

export interface TrackerState {
  recordsByDate: Record<string, Record<string, TrackerStatus>>; // localDate -> prayer -> status
  qazaSummary: QazaSummaryState;
  qazaLogs: QazaLogEntry[];

  // Actions
  setPrayerStatus: (localDate: string, prayer: string, status: TrackerStatus) => void;
  getPrayerStatus: (localDate: string, prayer: string) => TrackerStatus;
  undoPrayerStatus: (localDate: string, prayer: string) => void;

  // Qaza Actions
  incrementQaza: (prayer: keyof Omit<QazaSummaryState, 'dailyTarget' | 'totalCompleted'>, amount?: number) => void;
  repayQaza: (prayer: keyof Omit<QazaSummaryState, 'dailyTarget' | 'totalCompleted'>, quantity?: number) => void;
  setQazaCounts: (counts: Partial<QazaSummaryState>) => void;
  setDailyTarget: (target: number) => void;
}

const STORAGE_KEY = 'islamic_prayer_tracker_v1';

const DEFAULT_QAZA: QazaSummaryState = {
  fajr: 12,
  zuhr: 8,
  asr: 15,
  maghrib: 4,
  isha: 19,
  witr: 19,
  dailyTarget: 3,
  totalCompleted: 24,
};

function loadStoredTracker(): Partial<TrackerState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore storage error
  }
  return {};
}

function saveStoredTracker(state: TrackerState) {
  try {
    const toSave = {
      recordsByDate: state.recordsByDate,
      qazaSummary: state.qazaSummary,
      qazaLogs: state.qazaLogs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Ignore storage error
  }
}

const initial = loadStoredTracker();
const todayKey = new Date().toISOString().split('T')[0];

export const useTrackerStore = create<TrackerState>((set, get) => ({
  recordsByDate: initial.recordsByDate || {
    [todayKey]: {
      fajr: 'ADA',
      zuhr: 'ADA',
      asr: 'NONE',
      maghrib: 'NONE',
      isha: 'NONE',
    },
  },
  qazaSummary: initial.qazaSummary || DEFAULT_QAZA,
  qazaLogs: initial.qazaLogs || [
    {
      id: 'log-1',
      prayer: 'fajr',
      quantity: 1,
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      localDate: todayKey,
    },
    {
      id: 'log-2',
      prayer: 'zuhr',
      quantity: 1,
      completedAt: new Date(Date.now() - 7200000).toISOString(),
      localDate: todayKey,
    },
  ],

  setPrayerStatus: (localDate, prayer, status) => {
    set((state) => {
      const dateRecords = state.recordsByDate[localDate] || {};
      const updated = {
        ...state.recordsByDate,
        [localDate]: {
          ...dateRecords,
          [prayer]: status,
        },
      };
      const newState = { ...state, recordsByDate: updated };
      saveStoredTracker(newState);
      return { recordsByDate: updated };
    });
  },

  getPrayerStatus: (localDate, prayer) => {
    const state = get();
    return state.recordsByDate[localDate]?.[prayer] || 'NONE';
  },

  undoPrayerStatus: (localDate, prayer) => {
    set((state) => {
      const dateRecords = { ...(state.recordsByDate[localDate] || {}) };
      delete dateRecords[prayer];
      const updated = {
        ...state.recordsByDate,
        [localDate]: dateRecords,
      };
      const newState = { ...state, recordsByDate: updated };
      saveStoredTracker(newState);
      return { recordsByDate: updated };
    });
  },

  incrementQaza: (prayer, amount = 1) => {
    set((state) => {
      const updated = {
        ...state.qazaSummary,
        [prayer]: state.qazaSummary[prayer] + amount,
      };
      const newState = { ...state, qazaSummary: updated };
      saveStoredTracker(newState);
      return { qazaSummary: updated };
    });
  },

  repayQaza: (prayer, quantity = 1) => {
    set((state) => {
      const current = state.qazaSummary[prayer] || 0;
      if (current < quantity) return state; // Guard against negative

      const updatedSummary = {
        ...state.qazaSummary,
        [prayer]: Math.max(0, current - quantity),
        totalCompleted: state.qazaSummary.totalCompleted + quantity,
      };

      const newLog: QazaLogEntry = {
        id: `log-${Date.now()}`,
        prayer,
        quantity,
        completedAt: new Date().toISOString(),
        localDate: new Date().toISOString().split('T')[0],
      };

      const updatedLogs = [newLog, ...state.qazaLogs].slice(0, 50);
      const newState = { ...state, qazaSummary: updatedSummary, qazaLogs: updatedLogs };
      saveStoredTracker(newState);
      return { qazaSummary: updatedSummary, qazaLogs: updatedLogs };
    });
  },

  setQazaCounts: (counts) => {
    set((state) => {
      const updated = { ...state.qazaSummary, ...counts };
      const newState = { ...state, qazaSummary: updated };
      saveStoredTracker(newState);
      return { qazaSummary: updated };
    });
  },

  setDailyTarget: (target) => {
    set((state) => {
      const updated = { ...state.qazaSummary, dailyTarget: Math.max(1, target) };
      const newState = { ...state, qazaSummary: updated };
      saveStoredTracker(newState);
      return { qazaSummary: updated };
    });
  },
}));
