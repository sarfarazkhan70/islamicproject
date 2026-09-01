import { describe, it, expect } from 'vitest';
import {
  gregorianToHijri,
  hijriToGregorian,
  getMonthlyCalendarGrid,
  getMidnightRolloverDelay,
  getResolvedTimezone,
  HIJRI_MONTHS,
  ISLAMIC_EVENTS,
} from '../src/utils/hijriCalendar.js';

describe('Islamic Hijri Calendar Engine (Umm al-Qura & Automatic Live Date)', () => {
  describe('1. Authoritative Reference Date Verification', () => {
    it('should convert 2024-03-11 to 1 Ramadan 1445 AH (Umm al-Qura reference)', () => {
      const res = gregorianToHijri('2024-03-11', 0, 'Asia/Riyadh');
      expect(res.year).toBe(1445);
      expect(res.month).toBe(9);
      expect(res.day).toBe(1);
      expect(res.monthName).toBe('Ramadan');
      expect(res.monthNameArabic).toBe('رمضان');
      expect(res.formatted).toBe('1 Ramadan 1445 AH');
    });

    it('should convert 2024-04-10 to 1 Shawwal 1445 AH (Eid al-Fitr)', () => {
      const res = gregorianToHijri('2024-04-10', 0, 'Asia/Riyadh');
      expect(res.year).toBe(1445);
      expect(res.month).toBe(10);
      expect(res.day).toBe(1);
      expect(res.monthName).toBe('Shawwal');
      expect(res.event).toBe('Eid al-Fitr');
    });

    it('should convert 2024-06-16 to 10 Dhul Hijjah 1445 AH (Eid al-Adha)', () => {
      const res = gregorianToHijri('2024-06-16', 0, 'Asia/Riyadh');
      expect(res.year).toBe(1445);
      expect(res.month).toBe(12);
      expect(res.day).toBe(10);
      expect(res.isSacredMonth).toBe(true);
      expect(res.event).toBe('Eid al-Adha');
    });

    it('should convert 2024-07-07 to 1 Muharram 1446 AH (Islamic New Year)', () => {
      const res = gregorianToHijri('2024-07-07', 0, 'Asia/Riyadh');
      expect(res.year).toBe(1446);
      expect(res.month).toBe(1);
      expect(res.day).toBe(1);
      expect(res.event).toBe('Islamic New Year');
    });

    it('should convert 2025-03-01 to 1 Ramadan 1446 AH', () => {
      const res = gregorianToHijri('2025-03-01', 0, 'Asia/Riyadh');
      expect(res.year).toBe(1446);
      expect(res.month).toBe(9);
      expect(res.day).toBe(1);
    });

    it('should convert 2026-02-18 to 1 Ramadan 1447 AH', () => {
      const res = gregorianToHijri('2026-02-18', 0, 'Asia/Riyadh');
      expect(res.year).toBe(1447);
      expect(res.month).toBe(9);
      expect(res.day).toBe(1);
    });

    it('should convert 2026-09-01 (Current Date) to 19 Rabi-ul-Awwal 1448 AH', () => {
      const res = gregorianToHijri('2026-09-01', 0, 'Asia/Kolkata');
      expect(res.year).toBe(1448);
      expect(res.month).toBe(3);
      expect(res.day).toBe(19);
      expect(res.monthName).toBe('Rabi-ul-Awwal');
      expect(res.formatted).toBe('19 Rabi-ul-Awwal 1448 AH');
    });


    it('should convert 2027-02-08 to 1 Ramadan 1448 AH', () => {
      const res = gregorianToHijri('2027-02-08', 0, 'Asia/Riyadh');
      expect(res.year).toBe(1448);
      expect(res.month).toBe(9);
      expect(res.day).toBe(1);
    });
  });

  describe('2. Moon-sighting Adjustments (-2 to +2 days)', () => {
    it('should correctly shift day with -1 day adjustment', () => {
      const base = gregorianToHijri('2026-09-01', 0, 'Asia/Kolkata');
      const minusOne = gregorianToHijri('2026-09-01', -1, 'Asia/Kolkata');
      expect(minusOne.day).toBe(base.day - 1);
    });

    it('should correctly shift day with +1 day adjustment', () => {
      const base = gregorianToHijri('2026-09-01', 0, 'Asia/Kolkata');
      const plusOne = gregorianToHijri('2026-09-01', 1, 'Asia/Kolkata');
      expect(plusOne.day).toBe(base.day + 1);
    });

    it('should support full range of adjustments [-2, -1, 0, 1, 2]', () => {
      const m2 = gregorianToHijri('2026-09-01', -2);
      const m1 = gregorianToHijri('2026-09-01', -1);
      const p0 = gregorianToHijri('2026-09-01', 0);
      const p1 = gregorianToHijri('2026-09-01', 1);
      const p2 = gregorianToHijri('2026-09-01', 2);

      expect(m2.day).toBeLessThan(m1.day);
      expect(m1.day).toBeLessThan(p0.day);
      expect(p0.day).toBeLessThan(p1.day);
      expect(p1.day).toBeLessThan(p2.day);
    });
  });

  describe('3. Bidirectional Hijri to Gregorian Conversion', () => {
    it('should convert 1 Ramadan 1445 AH back to 2024-03-11', () => {
      const greg = hijriToGregorian(1445, 9, 1, 0);
      expect(greg.dateFormatted).toBe('2024-03-11');
    });

    it('should convert 1 Shawwal 1445 AH back to 2024-04-10', () => {
      const greg = hijriToGregorian(1445, 10, 1, 0);
      expect(greg.dateFormatted).toBe('2024-04-10');
    });

    it('should convert 1 Muharram 1446 AH back to 2024-07-07', () => {
      const greg = hijriToGregorian(1446, 1, 1, 0);
      expect(greg.dateFormatted).toBe('2024-07-07');
    });

    it('should convert 1 Ramadan 1448 AH back to 2027-02-08', () => {
      const greg = hijriToGregorian(1448, 9, 1, 0);
      expect(greg.dateFormatted).toBe('2027-02-08');
    });
  });

  describe('4. Islamic Sacred Months & Events', () => {
    it('should identify the 4 sacred Islamic months (Muharram, Rajab, Dhul Qidah, Dhul Hijjah)', () => {
      const sacredMonths = HIJRI_MONTHS.filter((m) => m.isSacred).map((m) => m.number);
      expect(sacredMonths).toEqual([1, 7, 11, 12]);
    });

    it('should match Day of Ashura on 10 Muharram', () => {
      const ashura = ISLAMIC_EVENTS.find((e) => e.title === 'Day of Ashura');
      expect(ashura).toBeDefined();
      expect(ashura?.hijriMonth).toBe(1);
      expect(ashura?.hijriDay).toBe(10);
    });

    it('should match Laylat al-Qadr on 27 Ramadan', () => {
      const qadr = ISLAMIC_EVENTS.find((e) => e.title.includes('Laylat al-Qadr'));
      expect(qadr).toBeDefined();
      expect(qadr?.hijriMonth).toBe(9);
      expect(qadr?.hijriDay).toBe(27);
    });
  });

  describe('5. Monthly Calendar Grid & Midnight Rollover', () => {
    it('should generate 30 days for September 2026', () => {
      const grid = getMonthlyCalendarGrid(2026, 9, 0, 'Asia/Kolkata');
      expect(grid.days).toHaveLength(30);
      expect(grid.year).toBe(2026);
      expect(grid.month).toBe(9);
      expect(grid.days[0].gregorianDate).toBe('2026-09-01');
      expect(grid.days[29].gregorianDate).toBe('2026-09-30');
    });

    it('should generate 29 days for February in leap year 2028', () => {
      const grid = getMonthlyCalendarGrid(2028, 2, 0, 'UTC');
      expect(grid.days).toHaveLength(29);
    });

    it('should compute valid positive midnight rollover delay in milliseconds', () => {
      const delay = getMidnightRolloverDelay();
      expect(delay).toBeGreaterThan(0);
      expect(delay).toBeLessThanOrEqual(86401000);
    });

    it('should resolve a non-empty system timezone string', () => {
      const tz = getResolvedTimezone();
      expect(typeof tz).toBe('string');
      expect(tz.length).toBeGreaterThan(0);
    });
  });
});
