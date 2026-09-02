import { describe, it, expect } from 'vitest';
import {
  gregorianToHijri,
  hijriToGregorian,
  getMonthlyCalendarGrid,
  getMidnightRolloverDelay,
  getResolvedTimezone,
  calculateMaghribDate,
  getMaghribRolloverDelay,
  HIJRI_MONTHS,
  ISLAMIC_EVENTS,
} from '../src/utils/hijriCalendar.js';

describe('Islamic Hijri Calendar Engine (Umm al-Qura & Automatic Live Date)', () => {
  describe('1. Authoritative Reference Date Verification', () => {
    it('should convert 2024-03-12 to 1 Ramadan 1445 AH (Umm al-Qura reference)', () => {
      const res = gregorianToHijri('2024-03-12', 0, 'Asia/Riyadh');
      expect(res.year).toBe(1445);
      expect(res.month).toBe(9);
      expect(res.day).toBe(1);
      expect(res.monthName).toBe('Ramadan');
      expect(res.monthNameArabic).toBe('رمضان');
      expect(res.formatted).toBe('1 Ramadan 1445 AH');
    });

    it('should convert 2024-04-11 to 1 Shawwal 1445 AH (Eid al-Fitr)', () => {
      const res = gregorianToHijri('2024-04-11', 0, 'Asia/Riyadh');
      expect(res.year).toBe(1445);
      expect(res.month).toBe(10);
      expect(res.day).toBe(1);
      expect(res.monthName).toBe('Shawwal');
      expect(res.event).toBe('Eid al-Fitr');
    });

    it('should convert 2024-06-17 to 10 Dhul Hijjah 1445 AH (Eid al-Adha)', () => {
      const res = gregorianToHijri('2024-06-17', 0, 'Asia/Riyadh');
      expect(res.year).toBe(1445);
      expect(res.month).toBe(12);
      expect(res.day).toBe(10);
      expect(res.isSacredMonth).toBe(true);
      expect(res.event).toBe('Eid al-Adha');
    });

    it('should convert 2024-07-08 to 1 Muharram 1446 AH (Islamic New Year)', () => {
      const res = gregorianToHijri('2024-07-08', 0, 'Asia/Riyadh');
      expect(res.year).toBe(1446);
      expect(res.month).toBe(1);
      expect(res.day).toBe(1);
      expect(res.event).toBe('Islamic New Year');
    });

    it('should convert 2026-09-02 (Current Date) to 19 Rabi-ul-Awwal 1448 AH', () => {
      const res = gregorianToHijri('2026-09-02', 0, 'Asia/Kolkata');
      expect(res.year).toBe(1448);
      expect(res.month).toBe(3);
      expect(res.day).toBe(19);
      expect(res.monthName).toBe('Rabi-ul-Awwal');
      expect(res.formatted).toBe('19 Rabi-ul-Awwal 1448 AH');
    });

    it('should convert 2026-09-03 to 20 Rabi-ul-Awwal 1448 AH', () => {
      const res = gregorianToHijri('2026-09-03', 0, 'Asia/Kolkata');
      expect(res.year).toBe(1448);
      expect(res.month).toBe(3);
      expect(res.day).toBe(20);
      expect(res.formatted).toBe('20 Rabi-ul-Awwal 1448 AH');
    });

    it('should convert 2026-09-04 to 21 Rabi-ul-Awwal 1448 AH', () => {
      const res = gregorianToHijri('2026-09-04', 0, 'Asia/Kolkata');
      expect(res.year).toBe(1448);
      expect(res.month).toBe(3);
      expect(res.day).toBe(21);
      expect(res.formatted).toBe('21 Rabi-ul-Awwal 1448 AH');
    });
  });

  describe('2. Moon-sighting Adjustments (-2 to +2 days)', () => {
    it('should correctly shift day with -1 day adjustment', () => {
      const base = gregorianToHijri('2026-09-02', 0, 'Asia/Kolkata');
      const minusOne = gregorianToHijri('2026-09-02', -1, 'Asia/Kolkata');
      expect(minusOne.day).toBe(base.day - 1);
    });

    it('should correctly shift day with +1 day adjustment', () => {
      const base = gregorianToHijri('2026-09-02', 0, 'Asia/Kolkata');
      const plusOne = gregorianToHijri('2026-09-02', 1, 'Asia/Kolkata');
      expect(plusOne.day).toBe(base.day + 1);
    });

    it('should support full range of adjustments [-2, -1, 0, 1, 2]', () => {
      const m2 = gregorianToHijri('2026-09-02', -2);
      const m1 = gregorianToHijri('2026-09-02', -1);
      const p0 = gregorianToHijri('2026-09-02', 0);
      const p1 = gregorianToHijri('2026-09-02', 1);
      const p2 = gregorianToHijri('2026-09-02', 2);

      expect(m2.day).toBeLessThan(m1.day);
      expect(m1.day).toBeLessThan(p0.day);
      expect(p0.day).toBeLessThan(p1.day);
      expect(p1.day).toBeLessThan(p2.day);
    });
  });

  describe('3. Bidirectional Hijri to Gregorian Conversion', () => {
    it('should convert 19 Rabi-ul-Awwal 1448 AH back to 2026-09-02', () => {
      const greg = hijriToGregorian(1448, 3, 19, 0);
      expect(greg.dateFormatted).toBe('2026-09-02');
    });

    it('should convert 20 Rabi-ul-Awwal 1448 AH back to 2026-09-03', () => {
      const greg = hijriToGregorian(1448, 3, 20, 0);
      expect(greg.dateFormatted).toBe('2026-09-03');
    });

    it('should convert 21 Rabi-ul-Awwal 1448 AH back to 2026-09-04', () => {
      const greg = hijriToGregorian(1448, 3, 21, 0);
      expect(greg.dateFormatted).toBe('2026-09-04');
    });

    it('should convert 1 Ramadan 1445 AH back to 2024-03-12', () => {
      const greg = hijriToGregorian(1445, 9, 1, 0);
      expect(greg.dateFormatted).toBe('2024-03-12');
    });

    it('should convert 1 Shawwal 1445 AH back to 2024-04-11', () => {
      const greg = hijriToGregorian(1445, 10, 1, 0);
      expect(greg.dateFormatted).toBe('2024-04-11');
    });

    it('should convert 1 Muharram 1446 AH back to 2024-07-08', () => {
      const greg = hijriToGregorian(1446, 1, 1, 0);
      expect(greg.dateFormatted).toBe('2024-07-08');
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
      expect(grid.days[1].gregorianDate).toBe('2026-09-02');
      expect(grid.days[1].day).toBe(19); // Sep 2 daytime is 19 Rabi-ul-Awwal
      expect(grid.days[2].gregorianDate).toBe('2026-09-03');
      expect(grid.days[2].day).toBe(20); // Sep 3 daytime is 20 Rabi-ul-Awwal
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

  describe('6. Islamic Day Boundary: Maghrib Sunset Transition (Critical Requirement)', () => {
    const delhiLoc = { latitude: 28.6139, longitude: 77.209 };
    const delhiTz = 'Asia/Kolkata';

    it('1. 2 September Before Maghrib (14:00) -> English: 2 September 2026, Hijri: 19 Rabi-ul-Awwal 1448 AH', () => {
      // 2026-09-02 14:00:00 IST (+05:30)
      const beforeMaghrib = new Date('2026-09-02T14:00:00+05:30');
      const res = gregorianToHijri(beforeMaghrib, 0, delhiTz, delhiLoc);

      expect(res.gregorianDate).toBe('2026-09-02');
      expect(res.year).toBe(1448);
      expect(res.month).toBe(3);
      expect(res.day).toBe(19);
      expect(res.monthName).toBe('Rabi-ul-Awwal');
      expect(res.formatted).toBe('19 Rabi-ul-Awwal 1448 AH');
    });

    it('2. 2 September Immediately After Maghrib (19:00) -> English: 2 September 2026, Hijri: 20 Rabi-ul-Awwal 1448 AH', () => {
      // 2026-09-02 19:00:00 IST (+05:30) (Sunset is ~18:41 IST)
      const afterMaghrib = new Date('2026-09-02T19:00:00+05:30');
      const res = gregorianToHijri(afterMaghrib, 0, delhiTz, delhiLoc);

      expect(res.gregorianDate).toBe('2026-09-02');
      expect(res.year).toBe(1448);
      expect(res.month).toBe(3);
      expect(res.day).toBe(20);
      expect(res.formatted).toBe('20 Rabi-ul-Awwal 1448 AH');
    });

    it('3. 2 September 11:59 PM after Maghrib -> English: 2 September 2026, Hijri: 20 Rabi-ul-Awwal 1448 AH', () => {
      // 2026-09-02 23:59:00 IST (+05:30)
      const lateNight = new Date('2026-09-02T23:59:00+05:30');
      const res = gregorianToHijri(lateNight, 0, delhiTz, delhiLoc);

      expect(res.gregorianDate).toBe('2026-09-02');
      expect(res.year).toBe(1448);
      expect(res.month).toBe(3);
      expect(res.day).toBe(20);
      expect(res.formatted).toBe('20 Rabi-ul-Awwal 1448 AH');
    });

    it('4. 3 September 12:01 AM after midnight -> English: 3 September 2026, Hijri: 20 Rabi-ul-Awwal 1448 AH', () => {
      // 2026-09-03 00:01:00 IST (+05:30) - Gregorian date changes to Sep 3, but Hijri date DOES NOT change at midnight!
      const afterMidnight = new Date('2026-09-03T00:01:00+05:30');
      const res = gregorianToHijri(afterMidnight, 0, delhiTz, delhiLoc);

      expect(res.gregorianDate).toBe('2026-09-03');
      expect(res.year).toBe(1448);
      expect(res.month).toBe(3);
      expect(res.day).toBe(20);
      expect(res.formatted).toBe('20 Rabi-ul-Awwal 1448 AH');
    });

    it('5. 3 September midday (12:00 PM) before Maghrib -> English: 3 September 2026, Hijri: 20 Rabi-ul-Awwal 1448 AH', () => {
      // 2026-09-03 12:00:00 IST (+05:30)
      const nextDayNoon = new Date('2026-09-03T12:00:00+05:30');
      const res = gregorianToHijri(nextDayNoon, 0, delhiTz, delhiLoc);

      expect(res.gregorianDate).toBe('2026-09-03');
      expect(res.year).toBe(1448);
      expect(res.month).toBe(3);
      expect(res.day).toBe(20);
      expect(res.formatted).toBe('20 Rabi-ul-Awwal 1448 AH');
    });

    it('6. 3 September After Maghrib (19:00) -> English: 3 September 2026, Hijri: 21 Rabi-ul-Awwal 1448 AH', () => {
      // 2026-09-03 19:00:00 IST (+05:30)
      const nextDayAfterMaghrib = new Date('2026-09-03T19:00:00+05:30');
      const res = gregorianToHijri(nextDayAfterMaghrib, 0, delhiTz, delhiLoc);

      expect(res.gregorianDate).toBe('2026-09-03');
      expect(res.year).toBe(1448);
      expect(res.month).toBe(3);
      expect(res.day).toBe(21);
      expect(res.formatted).toBe('21 Rabi-ul-Awwal 1448 AH');
    });

    it('7. Location / Timezone sensitivity at same global UTC instant', () => {
      // UTC instant: 2026-09-02T10:30:00Z
      const instant = new Date('2026-09-02T10:30:00Z');

      // In Tokyo (UTC+9), local time is 19:30 (Post-Maghrib at ~18:10 JST) -> 20 Rabi-ul-Awwal
      const tokyo = gregorianToHijri(instant, 0, 'Asia/Tokyo', { latitude: 35.6762, longitude: 139.6503 });
      expect(tokyo.day).toBe(20);

      // In London (UTC+1), local time is 11:30 (Pre-Maghrib at ~19:48 BST) -> 19 Rabi-ul-Awwal
      const london = gregorianToHijri(instant, 0, 'Europe/London', { latitude: 51.5074, longitude: -0.1278 });
      expect(london.day).toBe(19);
    });

    it('8. calculateMaghribDate calculates accurate local sunset timestamp', () => {
      const d = new Date('2026-09-02T12:00:00+05:30');
      const maghrib = calculateMaghribDate(d, delhiLoc.latitude, delhiLoc.longitude, delhiTz, 0);
      const hrs = maghrib.getUTCHours() + maghrib.getUTCMinutes() / 60 + 5.5;
      expect(hrs).toBeGreaterThan(18.5);
      expect(hrs).toBeLessThan(18.9);
    });

    it('9. getMaghribRolloverDelay computes accurate millisecond delay until next Maghrib', () => {
      const tBefore = new Date('2026-09-02T14:00:00+05:30');
      const delay = getMaghribRolloverDelay(delhiLoc, delhiTz, tBefore);
      // Between 14:00 and ~18:41 is ~4.7 hours = ~17,000,000 ms
      expect(delay).toBeGreaterThan(16000000);
      expect(delay).toBeLessThan(18000000);
    });
  });

  describe('7. Full Manual Hijri Date Setting, Adjustment & Mode Switching', () => {
    it('should format a completely custom manual Hijri date correctly', () => {
      const manualDate = { day: 20, month: 3, year: 1448 };
      const monthObj = HIJRI_MONTHS[manualDate.month - 1];

      const formatted = `${manualDate.day} ${monthObj.name} ${manualDate.year} AH`;
      const formattedArabic = `${manualDate.day} ${monthObj.arabicName} ${manualDate.year} هـ`;

      expect(formatted).toBe('20 Rabi-ul-Awwal 1448 AH');
      expect(formattedArabic).toBe('20 ربيع الأول 1448 هـ');
      expect(monthObj.isSacred).toBe(false);
    });

    it('should support manual selection across all 12 Islamic months including sacred months', () => {
      const sacredMonths = [1, 7, 11, 12];
      sacredMonths.forEach((mNum) => {
        const m = HIJRI_MONTHS.find((item) => item.number === mNum);
        expect(m).toBeDefined();
        expect(m?.isSacred).toBe(true);
      });
    });

    it('should match major Islamic events for manual dates (e.g. 1 Ramadan, 10 Muharram, 12 Rabi-ul-Awwal)', () => {
      const mawlid = ISLAMIC_EVENTS.find((e) => e.hijriMonth === 3 && e.hijriDay === 12);
      expect(mawlid).toBeDefined();
      expect(mawlid?.title).toBe('Mawlid an-Nabi');

      const ashura = ISLAMIC_EVENTS.find((e) => e.hijriMonth === 1 && e.hijriDay === 10);
      expect(ashura).toBeDefined();
      expect(ashura?.title).toBe('Day of Ashura');
    });

    it('should validate adjustment options (-1, 0, +1) on top of automatic calculated date', () => {
      const date = new Date('2026-09-02T14:00:00+05:30');
      const base = gregorianToHijri(date, 0, 'Asia/Kolkata', { latitude: 28.6139, longitude: 77.209 });
      const minus = gregorianToHijri(date, -1, 'Asia/Kolkata', { latitude: 28.6139, longitude: 77.209 });
      const plus = gregorianToHijri(date, 1, 'Asia/Kolkata', { latitude: 28.6139, longitude: 77.209 });

      expect(base.day).toBe(19);
      expect(minus.day).toBe(18);
      expect(plus.day).toBe(20);
    });
  });

  describe('8. Separate Gregorian (Midnight) and Hijri (Maghrib) Day Boundaries', () => {
    const delhiLoc = { latitude: 28.6139, longitude: 77.209 };
    const delhiTz = 'Asia/Kolkata';

    it('Gregorian: 2 September 11:59:59 PM -> Gregorian remains 2 September', () => {
      const t = new Date('2026-09-02T23:59:59+05:30');
      const res = gregorianToHijri(t, 0, delhiTz, delhiLoc);
      expect(res.gregorianDate).toBe('2026-09-02');
      expect(res.formatted).toBe('20 Rabi-ul-Awwal 1448 AH');
    });

    it('Gregorian: 3 September 12:00:00 AM -> Gregorian changes to 3 September, Hijri remains 20 Rabi-ul-Awwal', () => {
      const t = new Date('2026-09-03T00:00:00+05:30');
      const res = gregorianToHijri(t, 0, delhiTz, delhiLoc);
      expect(res.gregorianDate).toBe('2026-09-03');
      expect(res.formatted).toBe('20 Rabi-ul-Awwal 1448 AH');
    });

    it('Hijri: 2 September before Maghrib (14:00) -> 19 Rabi-ul-Awwal', () => {
      const t = new Date('2026-09-02T14:00:00+05:30');
      const res = gregorianToHijri(t, 0, delhiTz, delhiLoc);
      expect(res.gregorianDate).toBe('2026-09-02');
      expect(res.formatted).toBe('19 Rabi-ul-Awwal 1448 AH');
    });

    it('Hijri: 2 September after Maghrib (19:00) -> 20 Rabi-ul-Awwal', () => {
      const t = new Date('2026-09-02T19:00:00+05:30');
      const res = gregorianToHijri(t, 0, delhiTz, delhiLoc);
      expect(res.gregorianDate).toBe('2026-09-02');
      expect(res.formatted).toBe('20 Rabi-ul-Awwal 1448 AH');
    });

    it('Hijri: 2 September 11:59 PM -> 20 Rabi-ul-Awwal', () => {
      const t = new Date('2026-09-02T23:59:00+05:30');
      const res = gregorianToHijri(t, 0, delhiTz, delhiLoc);
      expect(res.gregorianDate).toBe('2026-09-02');
      expect(res.formatted).toBe('20 Rabi-ul-Awwal 1448 AH');
    });

    it('Hijri: 3 September 12:01 AM -> 20 Rabi-ul-Awwal', () => {
      const t = new Date('2026-09-03T00:01:00+05:30');
      const res = gregorianToHijri(t, 0, delhiTz, delhiLoc);
      expect(res.gregorianDate).toBe('2026-09-03');
      expect(res.formatted).toBe('20 Rabi-ul-Awwal 1448 AH');
    });

    it('Hijri: 3 September before Maghrib (12:00 PM) -> 20 Rabi-ul-Awwal', () => {
      const t = new Date('2026-09-03T12:00:00+05:30');
      const res = gregorianToHijri(t, 0, delhiTz, delhiLoc);
      expect(res.gregorianDate).toBe('2026-09-03');
      expect(res.formatted).toBe('20 Rabi-ul-Awwal 1448 AH');
    });

    it('Hijri: 3 September after Maghrib (19:00) -> 21 Rabi-ul-Awwal', () => {
      const t = new Date('2026-09-03T19:00:00+05:30');
      const res = gregorianToHijri(t, 0, delhiTz, delhiLoc);
      expect(res.gregorianDate).toBe('2026-09-03');
      expect(res.formatted).toBe('21 Rabi-ul-Awwal 1448 AH');
    });
  });
});
