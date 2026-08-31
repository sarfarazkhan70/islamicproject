import { create } from 'zustand';
import {
  getMonthlyCalendarGrid,
  gregorianToHijri,
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
  converterResultHijri: HijriDate | null;
  converterResultGregorian: string | null;

  // Actions
  setMonth: (year: number, month: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  setMoonAdjustment: (adjustment: number) => void;
  setSelectedDate: (date: HijriDate) => void;
  convertGregorian: (dateStr: string) => void;
  convertHijri: (year: number, month: number, day: number) => void;
}

const now = new Date();
const initialYear = now.getFullYear();
const initialMonth = now.getMonth() + 1;
const initialAdjustment = Number(localStorage.getItem('islamic_prayer_moon_adj') || 0);

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentYear: initialYear,
  currentMonth: initialMonth,
  moonAdjustment: initialAdjustment,
  calendarGrid: getMonthlyCalendarGrid(initialYear, initialMonth, initialAdjustment),
  events: ISLAMIC_EVENTS,
  selectedDate: gregorianToHijri(now, initialAdjustment),
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

  setMoonAdjustment: (adjustment: number) => {
    localStorage.setItem('islamic_prayer_moon_adj', String(adjustment));
    const { currentYear, currentMonth } = get();
    const now = new Date();
    set({
      moonAdjustment: adjustment,
      calendarGrid: getMonthlyCalendarGrid(currentYear, currentMonth, adjustment),
      selectedDate: gregorianToHijri(now, adjustment),
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
