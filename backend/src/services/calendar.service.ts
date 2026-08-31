import {
  gregorianToHijri,
  hijriToGregorian,
  getMonthlyCalendarGrid,
  ISLAMIC_EVENTS,
  HijriDate,
} from '../utils/hijriCalendar.js';

export class CalendarService {
  static toHijri(gregorianDateStr: string, adjustment: number = 0): HijriDate {
    return gregorianToHijri(gregorianDateStr, adjustment);
  }

  static toGregorian(
    hijriYear: number,
    hijriMonth: number,
    hijriDay: number,
    adjustment: number = 0
  ) {
    return hijriToGregorian(hijriYear, hijriMonth, hijriDay, adjustment);
  }

  static getMonthlyGrid(year: number, month: number, adjustment: number = 0) {
    return getMonthlyCalendarGrid(year, month, adjustment);
  }

  static getEvents() {
    return ISLAMIC_EVENTS;
  }
}
