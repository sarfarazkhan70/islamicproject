import { create } from 'zustand';
import {
  getMonthlyCalendarGrid,
  gregorianToHijri,
  getCentralHijriDate,
  hijriToGregorian,
  ISLAMIC_EVENTS,
  HijriDate,
  IslamicEvent,
} from '../utils/hijriCalendar.js';
import { useLocationStore } from './useLocationStore.js';
import { useSettingsStore } from './useSettingsStore.js';

interface CalendarState {
  currentYear: number;
  currentMonth: number;
  moonAdjustment: number;
  calendarGrid: ReturnType<typeof getMonthlyCalendarGrid>;
  events: IslamicEvent[];
  selectedDate: HijriDate;
  todayDate: HijriDate;
  converterResultHijri: HijriDate | null;
  converterResultGregorian: string | null;

  // Actions
  setMonth: (year: number, month: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  resetToToday: () => void;
  setMoonAdjustment: (adjustment: number) => void;
  setSelectedDate: (date: HijriDate) => void;
  convertGregorian: (dateStr: string) => void;
  convertHijri: (year: number, month: number, day: number) => void;
}

const getStoredMoonAdj = (): number => {
  try {
    const settings = useSettingsStore.getState();
    if (typeof settings.hijriAdjustment === 'number') return settings.hijriAdjustment;
    return Number(localStorage.getItem('islamic_prayer_moon_adj') || 0);
  } catch {
    return 0;
  }
};

const initialNow = new Date();
const initialYear = initialNow.getFullYear();
const initialMonth = initialNow.getMonth() + 1;
const initialAdjustment = getStoredMoonAdj();
const initialLoc = useLocationStore.getState();

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentYear: initialYear,
  currentMonth: initialMonth,
  moonAdjustment: initialAdjustment,
  calendarGrid: getMonthlyCalendarGrid(
    initialYear,
    initialMonth,
    initialAdjustment,
    initialLoc.timezone
  ),
  events: ISLAMIC_EVENTS,
  selectedDate: getCentralHijriDate(),
  todayDate: getCentralHijriDate(),
  converterResultHijri: null,
  converterResultGregorian: null,

  setMonth: (year: number, month: number) => {
    const { moonAdjustment } = get();
    const loc = useLocationStore.getState();
    set({
      currentYear: year,
      currentMonth: month,
      calendarGrid: getMonthlyCalendarGrid(year, month, moonAdjustment, loc.timezone),
    });
  },

  nextMonth: () => {
    const { currentYear, currentMonth, moonAdjustment } = get();
    const loc = useLocationStore.getState();
    const nextM = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextY = currentMonth === 12 ? currentYear + 1 : currentYear;
    set({
      currentYear: nextY,
      currentMonth: nextM,
      calendarGrid: getMonthlyCalendarGrid(nextY, nextM, moonAdjustment, loc.timezone),
    });
  },

  prevMonth: () => {
    const { currentYear, currentMonth, moonAdjustment } = get();
    const loc = useLocationStore.getState();
    const prevM = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevY = currentMonth === 1 ? currentYear - 1 : currentYear;
    set({
      currentYear: prevY,
      currentMonth: prevM,
      calendarGrid: getMonthlyCalendarGrid(prevY, prevM, moonAdjustment, loc.timezone),
    });
  },

  resetToToday: () => {
    const { moonAdjustment } = get();
    const loc = useLocationStore.getState();
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const today = getCentralHijriDate();
    set({
      currentYear: y,
      currentMonth: m,
      selectedDate: today,
      todayDate: today,
      calendarGrid: getMonthlyCalendarGrid(y, m, moonAdjustment, loc.timezone),
    });
  },

  setMoonAdjustment: (adjustment: number) => {
    try {
      localStorage.setItem('islamic_prayer_moon_adj', String(adjustment));
      useSettingsStore.getState().setHijriAdjustment(adjustment);
    } catch {}
    const { currentYear, currentMonth } = get();
    const loc = useLocationStore.getState();
    const today = getCentralHijriDate();
    set({
      moonAdjustment: adjustment,
      calendarGrid: getMonthlyCalendarGrid(currentYear, currentMonth, adjustment, loc.timezone),
      selectedDate: today,
      todayDate: today,
    });
  },

  setSelectedDate: (date: HijriDate) => {
    set({ selectedDate: date });
  },

  convertGregorian: (dateStr: string) => {
    const { moonAdjustment } = get();
    const loc = useLocationStore.getState();
    try {
      const res = gregorianToHijri(dateStr, moonAdjustment, loc.timezone, {
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
      set({ converterResultHijri: res });
    } catch {
      set({ converterResultHijri: null });
    }
  },

  convertHijri: (year: number, month: number, day: number) => {
    const { moonAdjustment } = get();
    try {
      const res = hijriToGregorian(year, month, day, moonAdjustment);
      set({ converterResultGregorian: res.dateFormatted });
    } catch {
      set({ converterResultGregorian: null });
    }
  },
}));

// Sync changes from central useLocationStore into useCalendarStore
useLocationStore.subscribe((locState) => {
  const { currentYear, currentMonth, moonAdjustment } = useCalendarStore.getState();
  const today = getCentralHijriDate();
  useCalendarStore.setState({
    todayDate: today,
    calendarGrid: getMonthlyCalendarGrid(
      currentYear,
      currentMonth,
      moonAdjustment,
      locState.timezone
    ),
  });
});

// Sync changes from useSettingsStore into useCalendarStore
useSettingsStore.subscribe((settingsState) => {
  const { currentYear, currentMonth } = useCalendarStore.getState();
  const loc = useLocationStore.getState();
  const today = getCentralHijriDate();
  useCalendarStore.setState({
    todayDate: today,
    selectedDate: today,
    moonAdjustment: settingsState.hijriAdjustment || 0,
    calendarGrid: getMonthlyCalendarGrid(
      currentYear,
      currentMonth,
      settingsState.hijriAdjustment || 0,
      loc.timezone
    ),
  });
});

