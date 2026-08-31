import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { PrayerRecord } from '../src/models/PrayerRecord.js';
import { QazaSummary } from '../src/models/QazaSummary.js';
import { QazaLog } from '../src/models/QazaLog.js';
import { generateAccessToken } from '../src/utils/jwt.js';

describe('Phase 4 — Namaz Tracker, Qaza & History Endpoints', () => {
  let userToken: string;
  let userBToken: string;
  let userId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await PrayerRecord.deleteMany({});
    await QazaSummary.deleteMany({});
    await QazaLog.deleteMany({});

    // Create User A directly
    const userA = await User.create({
      email: 'tracker_user@test.com',
      passwordHash: 'mock_hashed_password',
      isActive: true,
    });
    userId = userA._id.toString();
    userToken = generateAccessToken({ userId, email: userA.email });

    // Create User B directly for data isolation testing
    const userB = await User.create({
      email: 'user_b@test.com',
      passwordHash: 'mock_hashed_password',
      isActive: true,
    });
    userBToken = generateAccessToken({ userId: userB._id.toString(), email: userB.email });
  });

  describe('1. Tracker Endpoints (/api/v1/tracker)', () => {
    it('should create and update prayer status idempotently without duplicates', async () => {
      const payload = {
        localDate: '2026-08-31',
        prayer: 'fajr',
        status: 'ADA',
        scheduledTime: '05:02 AM',
        timezone: 'Asia/Karachi',
      };

      // 1. Mark Fajr as ADA
      const res1 = await request(app)
        .post('/api/v1/tracker')
        .set('Authorization', `Bearer ${userToken}`)
        .send(payload);

      expect(res1.status).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.data.record.status).toBe('ADA');
      expect(res1.body.data.record.prayer).toBe('fajr');

      // 2. Mark Fajr as ADA again (Idempotency test)
      const res2 = await request(app)
        .post('/api/v1/tracker')
        .set('Authorization', `Bearer ${userToken}`)
        .send(payload);

      expect(res2.status).toBe(200);

      // Verify in DB only 1 record exists
      const records = await PrayerRecord.find({ localDate: '2026-08-31', prayer: 'fajr' });
      expect(records).toHaveLength(1);

      // 3. Change status from ADA to MISSED
      const res3 = await request(app)
        .post('/api/v1/tracker')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...payload, status: 'MISSED' });

      expect(res3.status).toBe(200);
      expect(res3.body.data.record.status).toBe('MISSED');
    });

    it('should retrieve all prayer records for a specific local date', async () => {
      // Seed prayers for date
      const prayers = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];
      for (const p of prayers) {
        await request(app)
          .post('/api/v1/tracker')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            localDate: '2026-08-31',
            prayer: p,
            status: p === 'asr' ? 'MISSED' : 'ADA',
            scheduledTime: '12:00 PM',
          });
      }

      const getRes = await request(app)
        .get('/api/v1/tracker?date=2026-08-31')
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.records).toHaveLength(5);
      expect(getRes.body.data.date).toBe('2026-08-31');
    });

    it('should support bulk sync of prayer records', async () => {
      const bulkPayload = {
        records: [
          { localDate: '2026-08-30', prayer: 'fajr', status: 'ADA' },
          { localDate: '2026-08-30', prayer: 'zuhr', status: 'ADA' },
          { localDate: '2026-08-30', prayer: 'asr', status: 'EXCUSED' },
        ],
      };

      const res = await request(app)
        .post('/api/v1/tracker/bulk')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bulkPayload);

      expect(res.status).toBe(200);
      expect(res.body.data.syncedCount).toBe(3);

      const dbRecords = await PrayerRecord.find({ localDate: '2026-08-30' });
      expect(dbRecords).toHaveLength(3);
    });

    it('should allow undoing / resetting a prayer status', async () => {
      await request(app)
        .post('/api/v1/tracker')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          localDate: '2026-08-31',
          prayer: 'tahajjud',
          status: 'ADA',
          isVoluntary: true,
        });

      const delRes = await request(app)
        .delete('/api/v1/tracker')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ localDate: '2026-08-31', prayer: 'tahajjud' });

      expect(delRes.status).toBe(200);
      const remaining = await PrayerRecord.findOne({ localDate: '2026-08-31', prayer: 'tahajjud' });
      expect(remaining).toBeNull();
    });
  });

  describe('2. Qaza System Endpoints (/api/v1/qaza)', () => {
    it('should initialize and update Qaza counts and baseline', async () => {
      const getRes = await request(app)
        .get('/api/v1/qaza')
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.summary.fajr).toBe(0);

      // Update baseline
      const updateRes = await request(app)
        .put('/api/v1/qaza')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fajr: 10,
          zuhr: 10,
          asr: 10,
          maghrib: 10,
          isha: 10,
          witr: 10,
          dailyTarget: 5,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.summary.fajr).toBe(10);
      expect(updateRes.body.data.summary.dailyTarget).toBe(5);
    });

    it('should increment Qaza count using +1, +5 controls', async () => {
      const incRes = await request(app)
        .post('/api/v1/qaza/increment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ prayer: 'fajr', amount: 5 });

      expect(incRes.status).toBe(200);
      expect(incRes.body.data.summary.fajr).toBe(5);
    });

    it('should repay a Qaza prayer, decrement count, and record log', async () => {
      // Set initial count of 2
      await request(app)
        .put('/api/v1/qaza')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ fajr: 2 });

      // Repay 1 Fajr
      const repayRes = await request(app)
        .post('/api/v1/qaza/repay')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ prayer: 'fajr', quantity: 1 });

      expect(repayRes.status).toBe(200);
      expect(repayRes.body.data.summary.fajr).toBe(1);
      expect(repayRes.body.data.summary.totalCompleted).toBe(1);
      expect(repayRes.body.data.log.prayer).toBe('fajr');

      // Check log persistence
      const logsRes = await request(app)
        .get('/api/v1/qaza/logs')
        .set('Authorization', `Bearer ${userToken}`);

      expect(logsRes.status).toBe(200);
      expect(logsRes.body.data.logs).toHaveLength(1);
    });

    it('should prevent negative Qaza counts upon excessive repayment', async () => {
      await request(app)
        .put('/api/v1/qaza')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ asr: 1 });

      // Attempt to repay 2 Asr when count is 1
      const failRes = await request(app)
        .post('/api/v1/qaza/repay')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ prayer: 'asr', quantity: 2 });

      expect(failRes.status).toBe(400);
      expect(failRes.body.error.code).toBe('INSUFFICIENT_QAZA_COUNT');
    });
  });

  describe('3. History & Analytics Endpoints (/api/v1/history)', () => {
    it('should compute overall statistics, Ada percentage, and streaks', async () => {
      // Seed 2 consecutive successful days
      const days = ['2026-08-29', '2026-08-30'];
      for (const d of days) {
        for (const p of ['fajr', 'zuhr', 'asr', 'maghrib', 'isha']) {
          await request(app)
            .post('/api/v1/tracker')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
              localDate: d,
              prayer: p,
              status: 'ADA',
            });
        }
      }

      const summaryRes = await request(app)
        .get('/api/v1/history/summary')
        .set('Authorization', `Bearer ${userToken}`);

      expect(summaryRes.status).toBe(200);
      const stats = summaryRes.body.data.stats;
      expect(stats.totalTracked).toBe(10);
      expect(stats.ada).toBe(10);
      expect(stats.adaPercentage).toBe(100);
      expect(stats.longestStreak).toBe(2);
    });

    it('should compute monthly and yearly heatmap representation', async () => {
      await request(app)
        .post('/api/v1/tracker')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          localDate: '2026-08-31',
          prayer: 'fajr',
          status: 'ADA',
        });

      const heatmapRes = await request(app)
        .get('/api/v1/history/heatmap?year=2026')
        .set('Authorization', `Bearer ${userToken}`);

      expect(heatmapRes.status).toBe(200);
      expect(heatmapRes.body.data.year).toBe(2026);
      expect(heatmapRes.body.data.heatmap.length).toBeGreaterThan(0);
    });
  });

  describe('4. Security & Data Isolation', () => {
    it('should reject unauthenticated requests to tracker, qaza, and history', async () => {
      const res1 = await request(app).get('/api/v1/tracker');
      expect(res1.status).toBe(401);

      const res2 = await request(app).get('/api/v1/qaza');
      expect(res2.status).toBe(401);

      const res3 = await request(app).get('/api/v1/history/summary');
      expect(res3.status).toBe(401);
    });

    it('should strictly isolate tracker records between User A and User B', async () => {
      // User A marks Fajr
      await request(app)
        .post('/api/v1/tracker')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ localDate: '2026-08-31', prayer: 'fajr', status: 'ADA' });

      // User B requests same date
      const resB = await request(app)
        .get('/api/v1/tracker?date=2026-08-31')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(resB.status).toBe(200);
      expect(resB.body.data.records).toHaveLength(0); // User B cannot see User A records
    });
  });
});
