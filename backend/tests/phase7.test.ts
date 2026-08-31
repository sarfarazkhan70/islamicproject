import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { FastingRecord } from '../src/models/FastingRecord.js';
import { RamadanProgress } from '../src/models/RamadanProgress.js';
import { calculateQiblaBearing, calculateKaabaDistanceKm } from '../src/utils/qibla.js';
import { gregorianToHijri, hijriToGregorian } from '../src/utils/hijriCalendar.js';
import { generateAccessToken } from '../src/utils/jwt.js';

describe('Phase 7 — Qibla, Islamic Calendar & Ramadan Endpoints', () => {
  let userToken: string;
  let userBToken: string;
  let userId: string;
  let userBId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await FastingRecord.deleteMany({});
    await RamadanProgress.deleteMany({});

    // User A
    const userA = await User.create({
      email: 'phase7_user_a@test.com',
      passwordHash: 'mock_password_hash',
      isActive: true,
    });
    userId = userA._id.toString();
    userToken = generateAccessToken({ userId, email: userA.email });

    // User B
    const userB = await User.create({
      email: 'phase7_user_b@test.com',
      passwordHash: 'mock_password_hash',
      isActive: true,
    });
    userBId = userB._id.toString();
    userBToken = generateAccessToken({ userId: userBId, email: userB.email });
  });

  describe('1. Qibla Great-Circle Trigonometry Engine', () => {
    it('should calculate accurate Qibla bearings for reference global cities', () => {
      // 1. London (UK): 51.5074 N, -0.1278 W -> Expected ~119° (ESE)
      const londonBearing = calculateQiblaBearing(51.5074, -0.1278);
      expect(londonBearing).toBeGreaterThanOrEqual(118);
      expect(londonBearing).toBeLessThanOrEqual(120);

      // 2. New York (USA): 40.7128 N, -74.0060 W -> Expected ~58° (ENE)
      const nyBearing = calculateQiblaBearing(40.7128, -74.006);
      expect(nyBearing).toBeGreaterThanOrEqual(57);
      expect(nyBearing).toBeLessThanOrEqual(60);

      // 3. Mumbai (India): 19.0760 N, 72.8777 E -> Expected ~280° (WNW)
      const mumbaiBearing = calculateQiblaBearing(19.076, 72.8777);
      expect(mumbaiBearing).toBeGreaterThanOrEqual(279);
      expect(mumbaiBearing).toBeLessThanOrEqual(281);

      // 4. Tokyo (Japan): 35.6762 N, 139.6503 E -> Expected ~293° (WNW)
      const tokyoBearing = calculateQiblaBearing(35.6762, 139.6503);
      expect(tokyoBearing).toBeGreaterThanOrEqual(292);
      expect(tokyoBearing).toBeLessThanOrEqual(294);

      // 5. Cape Town (South Africa): -33.9249 S, 18.4241 E -> Expected ~23.4° (NNE)
      const capeTownBearing = calculateQiblaBearing(-33.9249, 18.4241);
      expect(capeTownBearing).toBeGreaterThanOrEqual(22);
      expect(capeTownBearing).toBeLessThanOrEqual(25);
    });

    it('should calculate accurate distance to the Kaaba in kilometers', () => {
      // London to Kaaba distance is approx 4,790 km
      const dist = calculateKaabaDistanceKm(51.5074, -0.1278);
      expect(dist).toBeGreaterThanOrEqual(4700);
      expect(dist).toBeLessThanOrEqual(4900);
    });

    it('should expose Qibla calculation via GET /api/v1/qibla/calculate', async () => {
      const res = await request(app).get('/api/v1/qibla/calculate?lat=51.5074&lng=-0.1278');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bearing).toBeDefined();
      expect(res.body.data.directionCompass).toBe('ESE');
      expect(res.body.data.distanceKm).toBeGreaterThan(4000);
    });

    it('should reject invalid coordinates in Qibla API', async () => {
      const res = await request(app).get('/api/v1/qibla/calculate?lat=invalid&lng=10');
      expect(res.status).toBe(400);
    });
  });

  describe('2. Islamic Hijri Calendar Engine & Conversions', () => {
    it('should convert Gregorian date to Hijri with Umm al-Qura baseline', () => {
      const hijri = gregorianToHijri('2026-08-31', 0);
      expect(hijri.year).toBe(1448);
      expect(hijri.monthName).toBeDefined();
      expect(hijri.day).toBeGreaterThanOrEqual(1);
      expect(hijri.day).toBeLessThanOrEqual(30);
    });

    it('should apply moon-sighting adjustments (-2 to +2 days) correctly', () => {
      const baseline = gregorianToHijri('2026-08-31', 0);
      const minusOne = gregorianToHijri('2026-08-31', -1);
      const plusOne = gregorianToHijri('2026-08-31', 1);

      expect(minusOne.day).not.toBe(plusOne.day);
      expect(Math.abs(baseline.day - minusOne.day)).toBeLessThanOrEqual(2);
    });

    it('should convert Hijri date back to Gregorian', () => {
      const greg = hijriToGregorian(1448, 9, 1, 0);
      expect(greg.year).toBeGreaterThanOrEqual(2026);
      expect(greg.month).toBeGreaterThanOrEqual(1);
      expect(greg.day).toBeGreaterThanOrEqual(1);
    });

    it('should return monthly calendar grid and Islamic events via API', async () => {
      const res1 = await request(app).get('/api/v1/calendar/monthly?year=2026&month=8');
      expect(res1.status).toBe(200);
      expect(res1.body.data.grid.days).toHaveLength(31);

      const res2 = await request(app).get('/api/v1/calendar/events');
      expect(res2.status).toBe(200);
      expect(res2.body.data.events.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('3. Ramadan Fasting & Quran Khatam Tracker', () => {
    it('should enforce authentication on fasting endpoints', async () => {
      const res = await request(app).get('/api/v1/ramadan/fasting');
      expect(res.status).toBe(401);
    });

    it('should log, update, and retrieve daily fasting records idempotently', async () => {
      const testDate = '2026-08-31';

      // 1. Log fast
      const logRes1 = await request(app)
        .post('/api/v1/ramadan/fasting')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          localDate: testDate,
          hijriYear: 1448,
          ramadanDay: 1,
          status: 'FASTED',
          notes: 'Completed full fast Alhamdulillah',
        });

      expect(logRes1.status).toBe(200);
      expect(logRes1.body.data.record.status).toBe('FASTED');

      // 2. Update same date to EXCUSED (Idempotency)
      const logRes2 = await request(app)
        .post('/api/v1/ramadan/fasting')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          localDate: testDate,
          hijriYear: 1448,
          ramadanDay: 1,
          status: 'EXCUSED',
        });

      expect(logRes2.status).toBe(200);
      expect(logRes2.body.data.record.status).toBe('EXCUSED');

      // Verify DB has only 1 record for this date
      const records = await FastingRecord.find({ userId, localDate: testDate });
      expect(records).toHaveLength(1);
    });

    it('should track 30-day Quran Khatam progress for user', async () => {
      const postRes = await request(app)
        .post('/api/v1/ramadan/khatam')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          hijriYear: 1448,
          completedJuz: [1, 2, 3, 4, 5],
          notes: 'Ahead of schedule',
        });

      expect(postRes.status).toBe(200);
      expect(postRes.body.data.progress.completedJuz).toEqual([1, 2, 3, 4, 5]);

      const getRes = await request(app)
        .get('/api/v1/ramadan/khatam?hijriYear=1448')
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.progress.completedJuz).toHaveLength(5);
    });

    it('should isolate fasting records between User A and User B', async () => {
      // User A logs fast
      await request(app)
        .post('/api/v1/ramadan/fasting')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          localDate: '2026-08-31',
          hijriYear: 1448,
          ramadanDay: 1,
          status: 'FASTED',
        });

      // User B checks records
      const resB = await request(app)
        .get('/api/v1/ramadan/fasting')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(resB.status).toBe(200);
      expect(resB.body.data.records).toHaveLength(0); // User B has 0 records
    });
  });
});
