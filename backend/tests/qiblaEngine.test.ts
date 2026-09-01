import { describe, it, expect } from 'vitest';
import {
  KAABA_COORDINATES,
  calculateQiblaBearing,
  calculateKaabaDistanceKm,
  getCompassCardinal,
  getRelativeQiblaAngle,
  isAlignedWithQibla,
  getQiblaInfo,
} from '../src/utils/qibla.js';

describe('Qibla Great-Circle Trigonometry Engine & Mathematical Tests', () => {
  describe('1. Kaaba Exact Coordinates Verification', () => {
    it('must use exact verified Kaaba coordinates (21.422487° N, 39.826206° E)', () => {
      expect(KAABA_COORDINATES.latitude).toBeCloseTo(21.422487, 6);
      expect(KAABA_COORDINATES.longitude).toBeCloseTo(39.826206, 6);
    });
  });

  describe('2. Indian Cities Bearing Calculations (Critical Test Set)', () => {
    it('should calculate mathematically verified Great-Circle bearing for Delhi (266.60° W)', () => {
      // Delhi: Lat 28.6139° N, Lng 77.2090° E (266.60° is within West sector 258.75° - 281.25°)
      const bearing = calculateQiblaBearing(28.6139, 77.2090);
      expect(bearing).toBeCloseTo(266.6, 1);
      expect(getCompassCardinal(bearing)).toBe('W');
    });

    it('should calculate mathematically verified Great-Circle bearing for Mumbai (280.07° W)', () => {
      // Mumbai: Lat 19.0760° N, Lng 72.8777° E (280.07° is within West sector 258.75° - 281.25°)
      const bearing = calculateQiblaBearing(19.0760, 72.8777);
      expect(bearing).toBeCloseTo(280.1, 1);
      expect(getCompassCardinal(bearing)).toBe('W');
    });

    it('should calculate mathematically verified Great-Circle bearing for Hyderabad (282.73° WNW)', () => {
      // Hyderabad: Lat 17.3850° N, Lng 78.4867° E
      const bearing = calculateQiblaBearing(17.3850, 78.4867);
      expect(bearing).toBeCloseTo(282.7, 1);
      expect(getCompassCardinal(bearing)).toBe('WNW');
    });

    it('should calculate mathematically verified Great-Circle bearing for Kolkata (278.21° W)', () => {
      // Kolkata: Lat 22.5726° N, Lng 88.3639° E
      const bearing = calculateQiblaBearing(22.5726, 88.3639);
      expect(bearing).toBeCloseTo(278.2, 1);
      expect(getCompassCardinal(bearing)).toBe('W');
    });

    it('should calculate mathematically verified Great-Circle bearing for Bengaluru (288.50° WNW)', () => {
      // Bengaluru: Lat 12.9716° N, Lng 77.5946° E
      const bearing = calculateQiblaBearing(12.9716, 77.5946);
      expect(bearing).toBeCloseTo(288.5, 1);
      expect(getCompassCardinal(bearing)).toBe('WNW');
    });

    it('should verify bearing varies accurately across all 5 Indian cities without hardcoding', () => {
      const delhi = calculateQiblaBearing(28.6139, 77.2090);
      const mumbai = calculateQiblaBearing(19.0760, 72.8777);
      const hyderabad = calculateQiblaBearing(17.3850, 78.4867);
      const kolkata = calculateQiblaBearing(22.5726, 88.3639);
      const bengaluru = calculateQiblaBearing(12.9716, 77.5946);

      const bearings = [delhi, mumbai, hyderabad, kolkata, bengaluru];
      const uniqueBearings = new Set(bearings);
      expect(uniqueBearings.size).toBe(5); // All 5 must be distinct
    });
  });

  describe('3. Global Reference Benchmarks', () => {
    it('should calculate accurate forward azimuth for London, UK (~119.0° ESE)', () => {
      const bearing = calculateQiblaBearing(51.5074, -0.1278);
      expect(bearing).toBeCloseTo(119.0, 1);
      expect(getCompassCardinal(bearing)).toBe('ESE');
    });

    it('should calculate accurate forward azimuth for New York, USA (~58.5° ENE)', () => {
      const bearing = calculateQiblaBearing(40.7128, -74.0060);
      expect(bearing).toBeCloseTo(58.5, 1);
      expect(getCompassCardinal(bearing)).toBe('ENE');
    });

    it('should calculate accurate forward azimuth for Tokyo, Japan (~293.0° WNW)', () => {
      const bearing = calculateQiblaBearing(35.6762, 139.6503);
      expect(bearing).toBeCloseTo(293.0, 1);
      expect(getCompassCardinal(bearing)).toBe('WNW');
    });

    it('should calculate accurate forward azimuth for Sydney, Australia (~277.5° W)', () => {
      const bearing = calculateQiblaBearing(-33.8688, 151.2093);
      expect(bearing).toBeCloseTo(277.5, 1);
      expect(getCompassCardinal(bearing)).toBe('W');
    });

    it('should calculate accurate forward azimuth for Cape Town, South Africa (~23.4° NNE)', () => {
      const bearing = calculateQiblaBearing(-33.9249, 18.4241);
      expect(bearing).toBeCloseTo(23.4, 1);
      expect(getCompassCardinal(bearing)).toBe('NNE');
    });
  });

  describe('4. Relative Needle Rotation & Heading Compensation', () => {
    it('should compute relative angle correctly when facing North (0°)', () => {
      const qiblaBearing = 266.6; // Delhi
      const heading = 0; // Facing North
      const relative = getRelativeQiblaAngle(qiblaBearing, heading);
      expect(relative).toBe(266.6); // Points to ~9 o'clock (West of North)
    });

    it('should compute relative angle correctly when facing East (90°)', () => {
      const qiblaBearing = 266.6;
      const heading = 90; // Facing East
      const relative = getRelativeQiblaAngle(qiblaBearing, heading);
      expect(relative).toBeCloseTo(176.6, 1); // Points behind/South
    });

    it('should compute relative angle correctly when facing South (180°)', () => {
      const qiblaBearing = 266.6;
      const heading = 180; // Facing South
      const relative = getRelativeQiblaAngle(qiblaBearing, heading);
      expect(relative).toBeCloseTo(86.6, 1); // Points right/West from South view
    });

    it('should compute relative angle correctly when facing West (270°)', () => {
      const qiblaBearing = 266.6;
      const heading = 270; // Facing West
      const relative = getRelativeQiblaAngle(qiblaBearing, heading);
      expect(relative).toBeCloseTo(356.6, 1); // Points almost straight ahead (0°/360°)
    });

    it('should compute 0° relative angle when device points directly to Qibla (heading = bearing)', () => {
      const qiblaBearing = 266.6;
      const heading = 266.6;
      const relative = getRelativeQiblaAngle(qiblaBearing, heading);
      expect(relative).toBe(0);
      expect(isAlignedWithQibla(qiblaBearing, heading, 3)).toBe(true);
    });

    it('should normalize negative relative angles to [0, 360)', () => {
      const qiblaBearing = 30;
      const heading = 60;
      // (30 - 60) = -30 -> 330
      const relative = getRelativeQiblaAngle(qiblaBearing, heading);
      expect(relative).toBe(330);
    });
  });

  describe('5. Alignment Threshold Logic (±3° Threshold)', () => {
    it('should detect alignment when device is within ±3° of Qibla', () => {
      const bearing = 280.1;
      expect(isAlignedWithQibla(bearing, 280.1, 3)).toBe(true);
      expect(isAlignedWithQibla(bearing, 282.0, 3)).toBe(true);
      expect(isAlignedWithQibla(bearing, 278.0, 3)).toBe(true);
      expect(isAlignedWithQibla(bearing, 283.5, 3)).toBe(false);
      expect(isAlignedWithQibla(bearing, 275.0, 3)).toBe(false);
    });

    it('should detect alignment correctly across the 0°/360° boundary', () => {
      const bearing = 1.0;
      expect(isAlignedWithQibla(bearing, 359.0, 3)).toBe(true); // 2° delta across 0°
      expect(isAlignedWithQibla(bearing, 357.0, 3)).toBe(false); // 4° delta
      expect(isAlignedWithQibla(bearing, 3.5, 3)).toBe(true); // 2.5° delta
    });
  });

  describe('6. Edge Cases & Boundary Conditions', () => {
    it('should return 0° bearing and 0 km distance when coordinates are at Kaaba itself', () => {
      const bearing = calculateQiblaBearing(KAABA_COORDINATES.latitude, KAABA_COORDINATES.longitude);
      const dist = calculateKaabaDistanceKm(KAABA_COORDINATES.latitude, KAABA_COORDINATES.longitude);
      expect(bearing).toBe(0);
      expect(dist).toBe(0);
    });

    it('should calculate bearing from North Pole (90° N) towards South (180°)', () => {
      const bearing = calculateQiblaBearing(89.99, 39.826206);
      expect(bearing).toBeCloseTo(180.0, 1);
    });

    it('should calculate bearing from South Pole (-90° S) towards North (0°)', () => {
      const bearing = calculateQiblaBearing(-89.99, 39.826206);
      expect(bearing).toBeCloseTo(0.0, 1);
    });
  });

  describe('7. getQiblaInfo Complete Bundle', () => {
    it('should return comprehensive bundle for Delhi', () => {
      const info = getQiblaInfo(28.6139, 77.2090);
      expect(info.bearing).toBeCloseTo(266.6, 1);
      expect(info.bearingFormatted).toContain('266.6');
      expect(info.directionCompass).toBe('W');
      expect(info.distanceKm).toBeGreaterThan(3500);
      expect(info.distanceMiles).toBeGreaterThan(2000);
      expect(info.userCoordinates.latitude).toBe(28.6139);
      expect(info.kaabaCoordinates.latitude).toBeCloseTo(21.422487, 6);
    });
  });
});
