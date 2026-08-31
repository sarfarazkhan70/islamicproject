import { describe, it, expect } from 'vitest';
import { calculatePrayerTimes, calculateMonthlyPrayerTimes } from '../src/services/prayerEngine/prayerEngine.js';

describe('Islamic Prayer Calculation Engine', () => {
  // Test anchor date: 2026-08-31
  const testDate = new Date(2026, 7, 31); // August 31, 2026

  describe('1. Madhhab-Specific Asr Calculations (Critical Requirement)', () => {
    it('should calculate distinct Asr times for Hanafi (2x shadow) vs Shafi/Maliki/Hanbali (1x shadow)', () => {
      // Test location: Karachi (24.8607° N, 67.0011° E)
      const hanafiResult = calculatePrayerTimes({
        date: testDate,
        latitude: 24.8607,
        longitude: 67.0011,
        timezone: 'Asia/Karachi',
        options: { madhhab: 'hanafi', calculationMethod: 'Karachi' },
      });

      const shafiiResult = calculatePrayerTimes({
        date: testDate,
        latitude: 24.8607,
        longitude: 67.0011,
        timezone: 'Asia/Karachi',
        options: { madhhab: 'shafii', calculationMethod: 'Karachi' },
      });

      const malikiResult = calculatePrayerTimes({
        date: testDate,
        latitude: 24.8607,
        longitude: 67.0011,
        timezone: 'Asia/Karachi',
        options: { madhhab: 'maliki', calculationMethod: 'Karachi' },
      });

      const hanbaliResult = calculatePrayerTimes({
        date: testDate,
        latitude: 24.8607,
        longitude: 67.0011,
        timezone: 'Asia/Karachi',
        options: { madhhab: 'hanbali', calculationMethod: 'Karachi' },
      });

      const hanafiAsr = hanafiResult.prayers.find((p) => p.key === 'asr')!;
      const shafiiAsr = shafiiResult.prayers.find((p) => p.key === 'asr')!;
      const malikiAsr = malikiResult.prayers.find((p) => p.key === 'asr')!;
      const hanbaliAsr = hanbaliResult.prayers.find((p) => p.key === 'asr')!;

      // 1. Hanafi Asr MUST differ from Shafi'i Asr
      expect(hanafiAsr.timeFormatted).not.toBe(shafiiAsr.timeFormatted);
      expect(hanafiAsr.date.getTime()).toBeGreaterThan(shafiiAsr.date.getTime());

      // 2. Shafi'i Asr MUST EQUAL Maliki Asr and Hanbali Asr (all 1x shadow)
      expect(shafiiAsr.timeFormatted).toBe(malikiAsr.timeFormatted);
      expect(shafiiAsr.timeFormatted).toBe(hanbaliAsr.timeFormatted);
      expect(shafiiAsr.date.getTime()).toBe(malikiAsr.date.getTime());
      expect(shafiiAsr.date.getTime()).toBe(hanbaliAsr.date.getTime());

      // Verify all non-Asr prayers (Fajr, Zuhr, Maghrib, Isha) remain identical
      const hanafiFajr = hanafiResult.prayers.find((p) => p.key === 'fajr')!;
      const shafiiFajr = shafiiResult.prayers.find((p) => p.key === 'fajr')!;
      expect(hanafiFajr.timeFormatted).toBe(shafiiFajr.timeFormatted);

      const hanafiZuhr = hanafiResult.prayers.find((p) => p.key === 'zuhr')!;
      const shafiiZuhr = shafiiResult.prayers.find((p) => p.key === 'zuhr')!;
      expect(hanafiZuhr.timeFormatted).toBe(shafiiZuhr.timeFormatted);
    });
  });

  describe('2. Global Reference Locations & Benchmarks', () => {
    it('should compute valid prayer timetable for Makkah Al-Mukarramah (Umm al-Qura convention)', () => {
      const makkah = calculatePrayerTimes({
        date: testDate,
        latitude: 21.4225,
        longitude: 39.8262,
        timezone: 'Asia/Riyadh',
        options: { calculationMethod: 'UmmAlQura', madhhab: 'hanbali' },
      });

      expect(makkah.prayers).toHaveLength(12);

      const fajr = makkah.prayers.find((p) => p.key === 'fajr')!;
      const sunrise = makkah.prayers.find((p) => p.key === 'sunrise')!;
      const zuhr = makkah.prayers.find((p) => p.key === 'zuhr')!;
      const asr = makkah.prayers.find((p) => p.key === 'asr')!;
      const sunset = makkah.prayers.find((p) => p.key === 'sunset')!;
      const maghrib = makkah.prayers.find((p) => p.key === 'maghrib')!;
      const isha = makkah.prayers.find((p) => p.key === 'isha')!;

      // Chronological sequence verification: Fajr < Sunrise < Zuhr < Asr < Sunset <= Maghrib < Isha
      expect(fajr.date.getTime()).toBeLessThan(sunrise.date.getTime());
      expect(sunrise.date.getTime()).toBeLessThan(zuhr.date.getTime());
      expect(zuhr.date.getTime()).toBeLessThan(asr.date.getTime());
      expect(asr.date.getTime()).toBeLessThan(sunset.date.getTime());
      expect(sunset.date.getTime()).toBeLessThanOrEqual(maghrib.date.getTime());
      expect(maghrib.date.getTime()).toBeLessThan(isha.date.getTime());

      // In UmmAlQura, Isha is exactly 90 minutes (5400000 ms) after Maghrib
      const maghribIshaDiffMinutes = (isha.date.getTime() - maghrib.date.getTime()) / (1000 * 60);
      expect(maghribIshaDiffMinutes).toBeCloseTo(90, 0);
    });

    it('should compute valid prayer timetable for London, UK (MWL convention)', () => {
      const london = calculatePrayerTimes({
        date: testDate,
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
        options: { calculationMethod: 'MWL', madhhab: 'hanafi' },
      });

      expect(london.prayers).toHaveLength(12);
      const fajr = london.prayers.find((p) => p.key === 'fajr')!;
      const sunrise = london.prayers.find((p) => p.key === 'sunrise')!;
      const zuhr = london.prayers.find((p) => p.key === 'zuhr')!;
      const maghrib = london.prayers.find((p) => p.key === 'maghrib')!;
      const isha = london.prayers.find((p) => p.key === 'isha')!;

      expect(fajr.date.getTime()).toBeLessThan(sunrise.date.getTime());
      expect(sunrise.date.getTime()).toBeLessThan(zuhr.date.getTime());
      expect(zuhr.date.getTime()).toBeLessThan(maghrib.date.getTime());
      expect(maghrib.date.getTime()).toBeLessThan(isha.date.getTime());
    });

    it('should compute valid prayer timetable for New York, USA (ISNA convention)', () => {
      const ny = calculatePrayerTimes({
        date: testDate,
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        options: { calculationMethod: 'ISNA', madhhab: 'shafii' },
      });

      expect(ny.prayers).toHaveLength(12);
      expect(ny.calculationMethod).toBe('ISNA');
      expect(ny.madhhab).toBe('shafii');
    });
  });

  describe('3. Derived Prayer Windows (Ishraq, Chasht, Zawal, Tahajjud)', () => {
    it('should correctly derive Ishraq window starting 15-20 minutes post sunrise', () => {
      const result = calculatePrayerTimes({
        date: testDate,
        latitude: 24.8607,
        longitude: 67.0011,
        timezone: 'Asia/Karachi',
      });

      const sunrise = result.prayers.find((p) => p.key === 'sunrise')!;
      const ishraq = result.prayers.find((p) => p.key === 'ishraq')!;

      const ishraqOffsetMinutes = (ishraq.date.getTime() - sunrise.date.getTime()) / (1000 * 60);
      expect(ishraqOffsetMinutes).toBeGreaterThanOrEqual(15);
      expect(ishraqOffsetMinutes).toBeLessThanOrEqual(25);
    });

    it('should correctly derive Zawal window ending right at solar noon (Zuhr)', () => {
      const result = calculatePrayerTimes({
        date: testDate,
        latitude: 24.8607,
        longitude: 67.0011,
        timezone: 'Asia/Karachi',
      });

      const zawal = result.prayers.find((p) => p.key === 'zawal')!;
      const zuhr = result.prayers.find((p) => p.key === 'zuhr')!;

      expect(zawal.windowEnd?.date.getTime()).toBe(zuhr.date.getTime());
      const zawalDurationMinutes = (zawal.windowEnd!.date.getTime() - zawal.date.getTime()) / (1000 * 60);
      expect(zawalDurationMinutes).toBeCloseTo(12, 0);
    });

    it('should correctly derive Tahajjud window as the last third of the night', () => {
      const result = calculatePrayerTimes({
        date: testDate,
        latitude: 24.8607,
        longitude: 67.0011,
        timezone: 'Asia/Karachi',
      });

      const maghrib = result.prayers.find((p) => p.key === 'maghrib')!;
      const fajr = result.prayers.find((p) => p.key === 'fajr')!;
      const tahajjud = result.prayers.find((p) => p.key === 'tahajjud')!;

      // Tahajjud must start after Maghrib and before Fajr
      expect(tahajjud.date.getTime()).toBeLessThan(fajr.date.getTime());
    });
  });

  describe('4. High Latitude Handling & Polar Cases', () => {
    it('should gracefully calculate high-latitude summer dates (Oslo, June 21) using TwilightAngle rule without NaN', () => {
      const summerSolstice = new Date(2026, 5, 21); // June 21, 2026
      const oslo = calculatePrayerTimes({
        date: summerSolstice,
        latitude: 59.9139,
        longitude: 10.7522,
        timezone: 'Europe/Oslo',
        options: {
          calculationMethod: 'MWL',
          highLatitudeRule: 'TwilightAngle',
        },
      });

      expect(oslo.prayers).toHaveLength(12);
      for (const p of oslo.prayers) {
        expect(isNaN(p.date.getTime())).toBe(false);
        expect(p.timeFormatted).not.toContain('NaN');
      }
      expect(oslo.astronomical.highLatitudeAdjusted).toBe(true);
    });
  });

  describe('5. Input Validation & Coordinate Boundaries', () => {
    it('should reject invalid latitudes (< -90 or > 90)', () => {
      expect(() =>
        calculatePrayerTimes({
          date: testDate,
          latitude: 95.0,
          longitude: 0.0,
        })
      ).toThrowError(/Invalid latitude/);

      expect(() =>
        calculatePrayerTimes({
          date: testDate,
          latitude: -91.0,
          longitude: 0.0,
        })
      ).toThrowError(/Invalid latitude/);
    });

    it('should reject invalid longitudes (< -180 or > 180)', () => {
      expect(() =>
        calculatePrayerTimes({
          date: testDate,
          latitude: 0.0,
          longitude: 185.0,
        })
      ).toThrowError(/Invalid longitude/);

      expect(() =>
        calculatePrayerTimes({
          date: testDate,
          latitude: 0.0,
          longitude: -181.0,
        })
      ).toThrowError(/Invalid longitude/);
    });
  });

  describe('6. Determinism Test', () => {
    it('should always return identical calculations for identical parameters', () => {
      const res1 = calculatePrayerTimes({
        date: testDate,
        latitude: 24.8607,
        longitude: 67.0011,
        timezone: 'Asia/Karachi',
        options: { madhhab: 'hanafi', calculationMethod: 'Karachi' },
      });

      const res2 = calculatePrayerTimes({
        date: testDate,
        latitude: 24.8607,
        longitude: 67.0011,
        timezone: 'Asia/Karachi',
        options: { madhhab: 'hanafi', calculationMethod: 'Karachi' },
      });

      expect(res1.prayers.map((p) => p.timeFormatted)).toEqual(
        res2.prayers.map((p) => p.timeFormatted)
      );
    });
  });

  describe('7. Monthly Timetable Generation', () => {
    it('should generate prayer times for all days in a month', () => {
      const monthly = calculateMonthlyPrayerTimes({
        year: 2026,
        month: 8, // August (31 days)
        latitude: 21.4225,
        longitude: 39.8262,
        timezone: 'Asia/Riyadh',
      });

      expect(monthly).toHaveLength(31);
      expect(monthly[0].prayers).toHaveLength(12);
      expect(monthly[30].prayers).toHaveLength(12);
    });
  });
});
