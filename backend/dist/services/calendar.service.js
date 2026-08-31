import { gregorianToHijri, hijriToGregorian, getMonthlyCalendarGrid, ISLAMIC_EVENTS, } from '../utils/hijriCalendar.js';
export class CalendarService {
    static toHijri(gregorianDateStr, adjustment = 0) {
        return gregorianToHijri(gregorianDateStr, adjustment);
    }
    static toGregorian(hijriYear, hijriMonth, hijriDay, adjustment = 0) {
        return hijriToGregorian(hijriYear, hijriMonth, hijriDay, adjustment);
    }
    static getMonthlyGrid(year, month, adjustment = 0) {
        return getMonthlyCalendarGrid(year, month, adjustment);
    }
    static getEvents() {
        return ISLAMIC_EVENTS;
    }
}
