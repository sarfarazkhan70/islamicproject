import {
  gregorianToHijri,
  hijriToGregorian,
  getMonthlyCalendarGrid,
  ISLAMIC_EVENTS,
  HijriDate,
} from '../utils/hijriCalendar.js';

export class CalendarService {
  static toHijri(
    gregorianDateStr: string,
    adjustment: number = 0,
    timezone?: string,
    location?: { latitude: number; longitude: number; maghribOffsetMinutes?: number }
  ): HijriDate {
    return gregorianToHijri(gregorianDateStr, adjustment, timezone, location);
  }

  static toGregorian(
    hijriYear: number,
    hijriMonth: number,
    hijriDay: number,
    adjustment: number = 0
  ) {
    return hijriToGregorian(hijriYear, hijriMonth, hijriDay, adjustment);
  }

  static getMonthlyGrid(
    year: number,
    month: number,
    adjustment: number = 0,
    timezone?: string
  ) {
    return getMonthlyCalendarGrid(year, month, adjustment, timezone);
  }

  static getEvents() {
    return ISLAMIC_EVENTS;
  }
}
