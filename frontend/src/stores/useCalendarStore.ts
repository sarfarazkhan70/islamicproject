import { create } from 'zustand';
import {
  getMonthlyCalendarGrid,
  gregorianToHijri,
  getCurrentHijriDate,
  hijriToGregorian,
  ISLAMIC_EVENTS,
  HijriDate,
  IslamicEvent,
} from '../utils/hijriCalendar.js';

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
    return Number(localStorage.getItem('islamic_prayer_moon_adj') || 0);
  } catch {
    return 0;
  }
};

const initialNow = new Date();
const initialYear = initialNow.getFullYear();
const initialMonth = initialNow.getMonth() + 1;
const initialAdjustment = getStoredMoonAdj();

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentYear: initialYear,
  currentMonth: initialMonth,
  moonAdjustment: initialAdjustment,
  calendarGrid: getMonthlyCalendarGrid(initialYear, initialMonth, initialAdjustment),
  events: ISLAMIC_EVENTS,
  selectedDate: getCurrentHijriDate(initialAdjustment),
  todayDate: getCurrentHijriDate(initialAdjustment),
  converterResultHijri: null,
  converterResultGregorian: null,

  setMonth: (year: number, month: number) => {
    const { moonAdjustment } = get();
    set({
      currentYear: year,
      currentMonth: month,
      calendarGrid: getMonthlyCalendarGrid(year, month, moonAdjustment),
    });
  },

  nextMonth: () => {
    const { currentYear, currentMonth, moonAdjustment } = get();
    const nextM = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextY = currentMonth === 12 ? currentYear + 1 : currentYear;
    set({
      currentYear: nextY,
      currentMonth: nextM,
      calendarGrid: getMonthlyCalendarGrid(nextY, nextM, moonAdjustment),
    });
  },

  prevMonth: () => {
    const { currentYear, currentMonth, moonAdjustment } = get();
    const prevM = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevY = currentMonth === 1 ? currentYear - 1 : currentYear;
    set({
      currentYear: prevY,
      currentMonth: prevM,
      calendarGrid: getMonthlyCalendarGrid(prevY, prevM, moonAdjustment),
    });
  },

  resetToToday: () => {
    const { moonAdjustment } = get();
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const today = getCurrentHijriDate(moonAdjustment);
    set({
      currentYear: y,
      currentMonth: m,
      selectedDate: today,
      todayDate: today,
      calendarGrid: getMonthlyCalendarGrid(y, m, moonAdjustment),
    });
  },

  setMoonAdjustment: (adjustment: number) => {
    try {
      localStorage.setItem('islamic_prayer_moon_adj', String(adjustment));
    } catch {}
    const { currentYear, currentMonth } = get();
    const today = getCurrentHijriDate(adjustment);
    set({
      moonAdjustment: adjustment,
      calendarGrid: getMonthlyCalendarGrid(currentYear, currentMonth, adjustment),
      selectedDate: today,
      todayDate: today,
    });
  },

  setSelectedDate: (date: HijriDate) => {
    set({ selectedDate: date });
  },

  convertGregorian: (dateStr: string) => {
    const { moonAdjustment } = get();
    try {
      const res = gregorianToHijri(dateStr, moonAdjustment);
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

