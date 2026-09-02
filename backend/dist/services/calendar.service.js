import { gregorianToHijri, hijriToGregorian, getMonthlyCalendarGrid, ISLAMIC_EVENTS, } from '../utils/hijriCalendar.js';
export class CalendarService {
    static toHijri(gregorianDateStr, adjustment = 0, timezone, location) {
        return gregorianToHijri(gregorianDateStr, adjustment, timezone, location);
    }
    static toGregorian(hijriYear, hijriMonth, hijriDay, adjustment = 0) {
        return hijriToGregorian(hijriYear, hijriMonth, hijriDay, adjustment);
    }
    static getMonthlyGrid(year, month, adjustment = 0, timezone) {
        return getMonthlyCalendarGrid(year, month, adjustment, timezone);
    }
    static getEvents() {
        return ISLAMIC_EVENTS;
    }
}
