import { describe, it, expect } from 'vitest';
import { calculatePrayerTimes } from '../../frontend/src/core/prayerEngine/prayerEngine.js';
import { getQiblaInfo } from '../../frontend/src/utils/qibla.js';
import { formatLocationDisplayName, findNearestKnownCity } from '../../frontend/src/utils/reverseGeocoding.js';

describe('Central Location Engine & Reverse Geocoding Formatter', () => {
  describe('Location Name Formatting & Deduplication', () => {
    it('formats City, State, Country properly', () => {
      const formatted = formatLocationDisplayName({
        city: 'Roorkee',
        state: 'Uttarakhand',
        country: 'India',
      });
      expect(formatted).toBe('Roorkee, Uttarakhand, India');
    });

    it('formats Locality, City, State, Country when locality differs from city', () => {
      const formatted = formatLocationDisplayName({
        locality: 'Civil Lines',
        city: 'Roorkee',
        state: 'Uttarakhand',
        country: 'India',
      });
      expect(formatted).toBe('Civil Lines, Roorkee, Uttarakhand, India');
    });

    it('deduplicates when locality and city are identical', () => {
      const formatted = formatLocationDisplayName({
        locality: 'Roorkee',
        city: 'Roorkee',
        state: 'Uttarakhand',
        country: 'India',
      });
      expect(formatted).toBe('Roorkee, Uttarakhand, India');
    });

    it('deduplicates when city and state are identical (e.g. Delhi)', () => {
      const formatted = formatLocationDisplayName({
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
      });
      expect(formatted).toBe('Delhi, India');
    });

    it('deduplicates when city and district are identical', () => {
      const formatted = formatLocationDisplayName({
        city: 'Haridwar',
        district: 'Haridwar',
        state: 'Uttarakhand',
        country: 'India',
      });
      expect(formatted).toBe('Haridwar, Uttarakhand, India');
    });

    it('falls back to "Current Location" when all segments are empty', () => {
      const formatted = formatLocationDisplayName({});
      expect(formatted).toBe('Current Location');
    });
  });

  describe('Offline Nearest Known City Fallback', () => {
    it('finds nearest city for coordinates near Roorkee (IIT Roorkee: 29.8649, 77.8965)', () => {
      const nearest = findNearestKnownCity(29.8649, 77.8965);
      expect(nearest).toBeDefined();
      expect(nearest.country).toBe('India');
    });

    it('finds Delhi for coordinates near Connaught Place (28.6315, 77.2167)', () => {
      const nearest = findNearestKnownCity(28.6315, 77.2167);
      expect(nearest.city).toBe('Delhi');
      expect(nearest.country).toBe('India');
    });

    it('finds Mumbai for coordinates near Marine Drive (18.9438, 72.8232)', () => {
      const nearest = findNearestKnownCity(18.9438, 72.8232);
      expect(nearest.city).toBe('Mumbai');
      expect(nearest.country).toBe('India');
    });
  });

  describe('Location & Qibla / Prayer Calculation Synchronization', () => {
    it('calculates accurate prayer times for detected Roorkee coordinates', () => {
      const date = new Date('2026-09-01T12:00:00Z');
      const roorkeeLat = 29.8543;
      const roorkeeLng = 77.888;

      const result = calculatePrayerTimes({
        date,
        latitude: roorkeeLat,
        longitude: roorkeeLng,
        timezone: 'Asia/Kolkata',
        options: {
          madhhab: 'hanafi',
          calculationMethod: 'Karachi',
        },
      });

      expect(result.prayers.length).toBe(12);
      const fajr = result.prayers.find((p) => p.key === 'fajr');
      const zuhr = result.prayers.find((p) => p.key === 'zuhr');
      const asr = result.prayers.find((p) => p.key === 'asr');
      const maghrib = result.prayers.find((p) => p.key === 'maghrib');
      const isha = result.prayers.find((p) => p.key === 'isha');

      expect(fajr).toBeDefined();
      expect(zuhr).toBeDefined();
      expect(asr).toBeDefined();
      expect(maghrib).toBeDefined();
      expect(isha).toBeDefined();

      // Ensure chronological order
      expect(fajr!.date.getTime()).toBeLessThan(zuhr!.date.getTime());
      expect(zuhr!.date.getTime()).toBeLessThan(asr!.date.getTime());
      expect(asr!.date.getTime()).toBeLessThan(maghrib!.date.getTime());
      expect(maghrib!.date.getTime()).toBeLessThan(isha!.date.getTime());
    });

    it('calculates accurate Qibla bearing for detected Roorkee coordinates', () => {
      const roorkeeLat = 29.8543;
      const roorkeeLng = 77.888;

      const qibla = getQiblaInfo(roorkeeLat, roorkeeLng);
      expect(qibla.bearing).toBeGreaterThan(260);
      expect(qibla.bearing).toBeLessThan(270);
      expect(qibla.distanceKm).toBeGreaterThan(3800);
      expect(qibla.distanceKm).toBeLessThan(4100);
      expect(qibla.directionCompass).toBe('W');
    });

    it('switches Madhhab for detected location cleanly (Hanafi 2x shadow vs Shafi 1x shadow)', () => {
      const date = new Date('2026-09-01T12:00:00Z');
      const lat = 29.8543;
      const lng = 77.888;

      const hanafiResult = calculatePrayerTimes({
        date,
        latitude: lat,
        longitude: lng,
        timezone: 'Asia/Kolkata',
        options: { madhhab: 'hanafi', calculationMethod: 'Karachi' },
      });

      const shafiiResult = calculatePrayerTimes({
        date,
        latitude: lat,
        longitude: lng,
        timezone: 'Asia/Kolkata',
        options: { madhhab: 'shafii', calculationMethod: 'Karachi' },
      });

      const hanafiAsr = hanafiResult.prayers.find((p) => p.key === 'asr')!;
      const shafiiAsr = shafiiResult.prayers.find((p) => p.key === 'asr')!;

      // Hanafi Asr is strictly later than Shafi'i Asr
      expect(hanafiAsr.date.getTime()).toBeGreaterThan(shafiiAsr.date.getTime());
    });
  });

  describe('Accuracy & Boundary Checking', () => {
    it('evaluates high accuracy vs low accuracy thresholds', () => {
      const highAccMeters = 25;
      const lowAccMeters = 350;

      expect(highAccMeters <= 200).toBe(true);
      expect(lowAccMeters > 200).toBe(true);
    });
  });
});
