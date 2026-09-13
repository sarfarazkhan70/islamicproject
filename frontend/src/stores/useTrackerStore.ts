import { create } from 'zustand';

export type TrackerStatus = 'ADA' | 'MISSED' | 'SAFAR' | 'EXCUSED' | 'QAZA' | 'NONE';

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

export interface QazaCompletionRecord {
  completedAtDate: string; // e.g. "2026-09-13"
  timestamp: string; // ISO string
}

export interface DateSummary {
  ada: number;
  missed: number;
  qaza: number;
  safarQaza: number;
  safar: number;
  totalTracked: number;
}

export interface MonthSummary {
  ada: number;
  missed: number;
  qaza: number;
  safarQaza: number;
  safar: number;
  qazaRemaining: number;
}

export interface TrackerState {
  recordsByDate: Record<string, Record<string, TrackerStatus>>; // localDate -> prayer -> status
  safarQazaByDate: Record<string, Record<string, boolean>>; // localDate -> prayer -> isSafarQaza
  qazaCompletionsByDate: Record<string, Record<string, QazaCompletionRecord>>; // originalDate -> prayer -> completion info
  qazaSummary: QazaSummaryState;
  qazaLogs: QazaLogEntry[];

  // Actions
  setPrayerStatus: (localDate: string, prayer: string, status: TrackerStatus) => void;
  getPrayerStatus: (localDate: string, prayer: string) => TrackerStatus;
  isPrayerSafarQaza: (localDate: string, prayer: string) => boolean;
  setSafarQaza: (localDate: string, prayer: string, isSafarQaza: boolean) => void;
  toggleSafarQaza: (localDate: string, prayer: string) => void;
  undoPrayerStatus: (localDate: string, prayer: string) => void;

  // Qaza History Actions
  markQazaAsAda: (originalDate: string, prayer: string, completedOnDate?: string) => void;
  getQazaCompletionInfo: (originalDate: string, prayer: string) => QazaCompletionRecord | undefined;
  getDateSummary: (localDate: string) => DateSummary;
  getMonthSummary: (year: number, month: number) => MonthSummary;

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

const OBLIGATORY_PRAYERS = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];

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
      safarQazaByDate: state.safarQazaByDate,
      qazaCompletionsByDate: state.qazaCompletionsByDate,
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
  safarQazaByDate: initial.safarQazaByDate || {},
  qazaCompletionsByDate: initial.qazaCompletionsByDate || {},
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
      const previousStatus = dateRecords[prayer] || 'NONE';
      const isPastDate = localDate < new Date().toISOString().split('T')[0];

      const updated = {
        ...state.recordsByDate,
        [localDate]: {
          ...dateRecords,
          [prayer]: status,
        },
      };

      // Manage Safar flags
      let updatedFlags = state.safarQazaByDate;
      if (status === 'ADA' || status === 'SAFAR' || status === 'NONE') {
        if (state.safarQazaByDate[localDate]?.[prayer]) {
          const dateFlags = { ...(state.safarQazaByDate[localDate] || {}) };
          delete dateFlags[prayer];
          updatedFlags = {
            ...state.safarQazaByDate,
            [localDate]: dateFlags,
          };
        }
      }

      // Manage Qaza completion records if a past missed prayer is marked ADA
      const completions = { ...(state.qazaCompletionsByDate[localDate] || {}) };
      let updatedCompletions = state.qazaCompletionsByDate;
      let updatedQazaSummary = state.qazaSummary;
      let updatedLogs = state.qazaLogs;

      if (status === 'ADA' && isPastDate && (previousStatus === 'MISSED' || previousStatus === 'QAZA')) {
        const todayStr = new Date().toISOString().split('T')[0];
        completions[prayer] = {
          completedAtDate: todayStr,
          timestamp: new Date().toISOString(),
        };
        updatedCompletions = {
          ...state.qazaCompletionsByDate,
          [localDate]: completions,
        };

        // If it's an obligatory prayer, adjust qaza summary
        if (prayer in state.qazaSummary) {
          const pKey = prayer as keyof Omit<QazaSummaryState, 'dailyTarget' | 'totalCompleted'>;
          const curr = state.qazaSummary[pKey] || 0;
          updatedQazaSummary = {
            ...state.qazaSummary,
            [pKey]: Math.max(0, curr - 1),
            totalCompleted: state.qazaSummary.totalCompleted + 1,
          };
          const newLog: QazaLogEntry = {
            id: `log-${Date.now()}`,
            prayer,
            quantity: 1,
            completedAt: new Date().toISOString(),
            localDate: todayStr,
          };
          updatedLogs = [newLog, ...state.qazaLogs].slice(0, 50);
        }
      } else if (status !== 'ADA' && completions[prayer]) {
        delete completions[prayer];
        updatedCompletions = {
          ...state.qazaCompletionsByDate,
          [localDate]: completions,
        };
      }

      const newState = {
        ...state,
        recordsByDate: updated,
        safarQazaByDate: updatedFlags,
        qazaCompletionsByDate: updatedCompletions,
        qazaSummary: updatedQazaSummary,
        qazaLogs: updatedLogs,
      };
      saveStoredTracker(newState);
      return newState;
    });
  },

  getPrayerStatus: (localDate, prayer) => {
    const state = get();
    return state.recordsByDate[localDate]?.[prayer] || 'NONE';
  },

  isPrayerSafarQaza: (localDate, prayer) => {
    const state = get();
    return Boolean(state.safarQazaByDate?.[localDate]?.[prayer]);
  },

  setSafarQaza: (localDate, prayer, isSafarQaza) => {
    set((state) => {
      const dateFlags = { ...(state.safarQazaByDate[localDate] || {}) };
      if (isSafarQaza) {
        dateFlags[prayer] = true;
      } else {
        delete dateFlags[prayer];
      }
      const updatedFlags = {
        ...state.safarQazaByDate,
        [localDate]: dateFlags,
      };

      // If checking Safar Mein Qaza and prayer is not yet marked MISSED or QAZA, mark as MISSED
      let updatedRecords = state.recordsByDate;
      const currentStatus = state.recordsByDate[localDate]?.[prayer] || 'NONE';
      if (isSafarQaza && currentStatus !== 'MISSED' && currentStatus !== 'QAZA') {
        const dateRecords = state.recordsByDate[localDate] || {};
        updatedRecords = {
          ...state.recordsByDate,
          [localDate]: {
            ...dateRecords,
            [prayer]: 'MISSED',
          },
        };
      }

      const newState = { ...state, safarQazaByDate: updatedFlags, recordsByDate: updatedRecords };
      saveStoredTracker(newState);
      return { safarQazaByDate: updatedFlags, recordsByDate: updatedRecords };
    });
  },

  toggleSafarQaza: (localDate, prayer) => {
    const current = get().isPrayerSafarQaza(localDate, prayer);
    get().setSafarQaza(localDate, prayer, !current);
  },

  undoPrayerStatus: (localDate, prayer) => {
    set((state) => {
      const dateRecords = { ...(state.recordsByDate[localDate] || {}) };
      delete dateRecords[prayer];
      const updatedRecords = {
        ...state.recordsByDate,
        [localDate]: dateRecords,
      };

      const dateFlags = { ...(state.safarQazaByDate[localDate] || {}) };
      delete dateFlags[prayer];
      const updatedFlags = {
        ...state.safarQazaByDate,
        [localDate]: dateFlags,
      };

      const dateCompletions = { ...(state.qazaCompletionsByDate[localDate] || {}) };
      delete dateCompletions[prayer];
      const updatedCompletions = {
        ...state.qazaCompletionsByDate,
        [localDate]: dateCompletions,
      };

      const newState = {
        ...state,
        recordsByDate: updatedRecords,
        safarQazaByDate: updatedFlags,
        qazaCompletionsByDate: updatedCompletions,
      };
      saveStoredTracker(newState);
      return newState;
    });
  },

  markQazaAsAda: (originalDate, prayer, completedOnDate) => {
    const todayStr = completedOnDate || new Date().toISOString().split('T')[0];
    set((state) => {
      const dateRecords = state.recordsByDate[originalDate] || {};
      const updatedRecords = {
        ...state.recordsByDate,
        [originalDate]: {
          ...dateRecords,
          [prayer]: 'ADA' as TrackerStatus,
        },
      };

      // Store Qaza completion date
      const completions = { ...(state.qazaCompletionsByDate[originalDate] || {}) };
      completions[prayer] = {
        completedAtDate: todayStr,
        timestamp: new Date().toISOString(),
      };
      const updatedCompletions = {
        ...state.qazaCompletionsByDate,
        [originalDate]: completions,
      };

      // Clear Safar flag for this prayer since it is fulfilled as Ada
      const dateFlags = { ...(state.safarQazaByDate[originalDate] || {}) };
      delete dateFlags[prayer];
      const updatedFlags = {
        ...state.safarQazaByDate,
        [originalDate]: dateFlags,
      };

      // Decrement qazaSummary if applicable
      let updatedSummary = state.qazaSummary;
      if (prayer in state.qazaSummary) {
        const pKey = prayer as keyof Omit<QazaSummaryState, 'dailyTarget' | 'totalCompleted'>;
        const current = state.qazaSummary[pKey] || 0;
        updatedSummary = {
          ...state.qazaSummary,
          [pKey]: Math.max(0, current - 1),
          totalCompleted: state.qazaSummary.totalCompleted + 1,
        };
      }

      const newLog: QazaLogEntry = {
        id: `log-${Date.now()}`,
        prayer,
        quantity: 1,
        completedAt: new Date().toISOString(),
        localDate: todayStr,
      };

      const updatedLogs = [newLog, ...state.qazaLogs].slice(0, 50);

      const newState = {
        ...state,
        recordsByDate: updatedRecords,
        safarQazaByDate: updatedFlags,
        qazaCompletionsByDate: updatedCompletions,
        qazaSummary: updatedSummary,
        qazaLogs: updatedLogs,
      };
      saveStoredTracker(newState);
      return newState;
    });
  },

  getQazaCompletionInfo: (originalDate, prayer) => {
    const state = get();
    return state.qazaCompletionsByDate[originalDate]?.[prayer];
  },

  getDateSummary: (localDate) => {
    const state = get();
    const dayRecords = state.recordsByDate[localDate] || {};
    const daySafarFlags = state.safarQazaByDate[localDate] || {};

    let ada = 0;
    let missed = 0;
    let qaza = 0;
    let safarQaza = 0;
    let safar = 0;
    let totalTracked = 0;

    for (const p of OBLIGATORY_PRAYERS) {
      const status = dayRecords[p] || 'NONE';
      const isSq = Boolean(daySafarFlags[p]);

      if (status !== 'NONE') totalTracked++;

      if (status === 'ADA') {
        ada++;
      } else if (status === 'SAFAR' || status === 'EXCUSED') {
        safar++;
      } else if (isSq) {
        safarQaza++;
      } else if (status === 'MISSED') {
        missed++;
      } else if (status === 'QAZA') {
        qaza++;
      }
    }

    return { ada, missed, qaza, safarQaza, safar, totalTracked };
  },

  getMonthSummary: (year, month) => {
    const state = get();
    const prefix = `${year}-${String(month).padStart(2, '0')}-`;

    let totalAda = 0;
    let totalMissed = 0;
    let totalQaza = 0;
    let totalSafarQaza = 0;
    let totalSafar = 0;

    for (const [dateStr, prayers] of Object.entries(state.recordsByDate)) {
      if (!dateStr.startsWith(prefix)) continue;
      const safarFlags = state.safarQazaByDate[dateStr] || {};

      for (const p of OBLIGATORY_PRAYERS) {
        const status = prayers[p] || 'NONE';
        const isSq = Boolean(safarFlags[p]);

        if (status === 'ADA') {
          totalAda++;
        } else if (status === 'SAFAR' || status === 'EXCUSED') {
          totalSafar++;
        } else if (isSq) {
          totalSafarQaza++;
        } else if (status === 'MISSED') {
          totalMissed++;
        } else if (status === 'QAZA') {
          totalQaza++;
        }
      }
    }

    const qazaRemaining =
      state.qazaSummary.fajr +
      state.qazaSummary.zuhr +
      state.qazaSummary.asr +
      state.qazaSummary.maghrib +
      state.qazaSummary.isha;

    return {
      ada: totalAda,
      missed: totalMissed,
      qaza: totalQaza,
      safarQaza: totalSafarQaza,
      safar: totalSafar,
      qazaRemaining,
    };
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
