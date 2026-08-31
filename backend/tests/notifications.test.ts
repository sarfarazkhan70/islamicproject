import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { UserPreferences } from '../src/models/UserPreferences.js';
import { PushSubscription } from '../src/models/PushSubscription.js';
import { NotificationJob } from '../src/models/NotificationJob.js';
import { NotificationSchedulerService } from '../src/services/notificationScheduler.service.js';
import { localTimeToUtcDate } from '../src/utils/timezone.js';
import { generateAccessToken } from '../src/utils/jwt.js';

describe('Phase 5 — Web Push, Notifications & Scheduler Tests', () => {
  let userToken: string;
  let userBToken: string;
  let userId: string;
  let userBId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await UserPreferences.deleteMany({});
    await PushSubscription.deleteMany({});
    await NotificationJob.deleteMany({});

    // Create User A
    const userA = await User.create({
      email: 'notif_user_a@test.com',
      passwordHash: 'mock_hashed_password',
      isActive: true,
    });
    userId = userA._id.toString();
    userToken = generateAccessToken({ userId, email: userA.email });

    // Seed default preferences for User A
    await UserPreferences.create({
      userId: userA._id,
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.076], // Mumbai
        city: 'Mumbai',
        country: 'India',
        timezone: 'Asia/Kolkata',
        isAutoDetected: true,
      },
      madhhab: 'hanafi',
      calculationMethod: 'Karachi',
      highLatitudeRule: 'TwilightAngle',
      timeFormat: '12h',
      theme: 'emerald-dark',
      adhanSound: 'makkah',
      hijriDateAdjustment: 0,
      notifications: {
        enabled: true,
        prayerReminders: {
          enabled: true,
          fajr: true,
          zuhr: true,
          asr: true,
          maghrib: true,
          isha: true,
          leadTimeMinutes: 0,
        },
        surahMulk11pm: {
          enabled: true,
          time: '23:00',
        },
        fridayKahf: {
          enabled: true,
          leadTimeMinutes: 60,
        },
        jumuahTime: '13:30',
        soundEnabled: true,
      },
    });

    // Create User B for isolation testing
    const userB = await User.create({
      email: 'notif_user_b@test.com',
      passwordHash: 'mock_hashed_password',
      isActive: true,
    });
    userBId = userB._id.toString();
    userBToken = generateAccessToken({ userId: userBId, email: userB.email });

    await UserPreferences.create({
      userId: userB._id,
      location: {
        type: 'Point',
        coordinates: [-0.1278, 51.5074], // London
        city: 'London',
        country: 'United Kingdom',
        timezone: 'Europe/London',
        isAutoDetected: true,
      },
      madhhab: 'shafii',
    });
  });

  describe('1. Push Subscription Lifecycle & Preferences', () => {
    it('should fetch default notification preferences', async () => {
      const res = await request(app)
        .get('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.preferences.enabled).toBe(true);
      expect(res.body.data.preferences.surahMulk11pm.enabled).toBe(true);
      expect(res.body.data.preferences.fridayKahf.enabled).toBe(true);
      expect(res.body.data.preferences.prayerReminders.leadTimeMinutes).toBe(0);
    });

    it('should update notification preferences and lead time', async () => {
      const res = await request(app)
        .patch('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          prayerReminders: {
            leadTimeMinutes: 10,
            fajr: true,
            zuhr: false,
          },
          jumuahTime: '13:00',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.preferences.prayerReminders.leadTimeMinutes).toBe(10);
      expect(res.body.data.preferences.prayerReminders.zuhr).toBe(false);
      expect(res.body.data.preferences.jumuahTime).toBe('13:00');
    });

    it('should subscribe a browser endpoint to Web Push and prevent duplicates', async () => {
      const subPayload = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-sub-token-12345',
        keys: {
          p256dh: 'BNcRdreALRF8M-vQ7WhkgDYcwTmwQmDPW0P0-test-key',
          auth: 'tH9bV8-test-auth-secret',
        },
        device: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
          platform: 'Win32',
        },
      };

      // 1. First subscription
      const res1 = await request(app)
        .post('/api/v1/notifications/subscribe')
        .set('Authorization', `Bearer ${userToken}`)
        .send(subPayload);

      expect(res1.status).toBe(201);
      expect(res1.body.data.subscription.endpoint).toBe(subPayload.endpoint);

      // 2. Resubscribe same endpoint (Idempotency test)
      const res2 = await request(app)
        .post('/api/v1/notifications/subscribe')
        .set('Authorization', `Bearer ${userToken}`)
        .send(subPayload);

      expect(res2.status).toBe(201);

      // Verify in DB only 1 subscription exists
      const subs = await PushSubscription.find({ userId, endpoint: subPayload.endpoint });
      expect(subs).toHaveLength(1);
    });

    it('should return subscription status with VAPID public key', async () => {
      await request(app)
        .post('/api/v1/notifications/subscribe')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/test-endpoint',
          keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
        });

      const res = await request(app)
        .get('/api/v1/notifications/status')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.hasActiveSubscription).toBe(true);
      expect(res.body.data.activeDeviceCount).toBe(1);
      expect(res.body.data.vapidPublicKey).toBeDefined();
    });

    it('should unsubscribe and deactivate a subscription', async () => {
      const endpoint = 'https://fcm.googleapis.com/fcm/send/unsub-test';
      await request(app)
        .post('/api/v1/notifications/subscribe')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          endpoint,
          keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
        });

      const unsubRes = await request(app)
        .post('/api/v1/notifications/unsubscribe')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ endpoint });

      expect(unsubRes.status).toBe(200);
      expect(unsubRes.body.data.unsubscribed).toBe(true);

      const subInDb = await PushSubscription.findOne({ endpoint });
      expect(subInDb?.isActive).toBe(false);
    });
  });

  describe('2. Timezone-Aware Scheduling & Idempotency', () => {
    it('should schedule 11:00 PM Surah Al-Mulk reminder at 23:00 local user time', async () => {
      // 1. Asia/Kolkata (UTC +5:30): 23:00 local -> 17:30 UTC
      const kolkataTime = localTimeToUtcDate('2026-08-31', '23:00', 'Asia/Kolkata');
      expect(kolkataTime.toISOString()).toBe('2026-08-31T17:30:00.000Z');

      // 2. Europe/London (BST UTC +1 in August): 23:00 local -> 22:00 UTC
      const londonTime = localTimeToUtcDate('2026-08-31', '23:00', 'Europe/London');
      expect(londonTime.toISOString()).toBe('2026-08-31T22:00:00.000Z');

      // 3. America/New_York (EDT UTC -4 in August): 23:00 local -> 03:00 UTC next day
      const nyTime = localTimeToUtcDate('2026-08-31', '23:00', 'America/New_York');
      expect(nyTime.toISOString()).toBe('2026-09-01T03:00:00.000Z');
    });

    it('should generate daily jobs idempotently without duplicate records', async () => {
      const testDate = '2026-08-31';

      // 1. First run
      const count1 = await NotificationSchedulerService.scheduleDailyJobsForUser(userId, testDate);
      expect(count1).toBeGreaterThanOrEqual(6); // 5 prayers + 1 Surah Mulk

      // 2. Second run (re-scheduling same day)
      await NotificationSchedulerService.scheduleDailyJobsForUser(userId, testDate);

      // Verify no duplicate records created in DB
      const jobs = await NotificationJob.find({ userId, targetDate: testDate });
      expect(jobs).toHaveLength(count1);
    });

    it('should schedule Friday Surah Al-Kahf reminder exactly 1 hour prior to Jumuah', async () => {
      // 2026-09-04 is a Friday
      const fridayDate = '2026-09-04';

      await NotificationSchedulerService.scheduleDailyJobsForUser(userId, fridayDate);

      const kahfJob = await NotificationJob.findOne({
        userId,
        type: 'JUMUAH_KAHF_REMINDER',
        targetDate: fridayDate,
      });

      expect(kahfJob).toBeDefined();
      expect(kahfJob?.targetTime).toBe('13:30'); // Configured Jumu'ah time

      // In Asia/Kolkata (UTC +5:30), Jumu'ah 13:30 local = 08:00 UTC
      // 1 Hour prior = 12:30 local = 07:00 UTC
      expect(kahfJob?.scheduledAt.toISOString()).toBe('2026-09-04T07:00:00.000Z');
    });

    it('should not schedule Friday Kahf reminder on non-Friday days', async () => {
      // 2026-08-31 is Monday
      const mondayDate = '2026-08-31';
      await NotificationSchedulerService.scheduleDailyJobsForUser(userId, mondayDate);

      const kahfJob = await NotificationJob.findOne({
        userId,
        type: 'JUMUAH_KAHF_REMINDER',
        targetDate: mondayDate,
      });

      expect(kahfJob).toBeNull();
    });

    it('should respect Madhhab Asr distinction in prayer reminder schedules', async () => {
      const testDate = '2026-08-31';

      // User A (Hanafi, Mumbai)
      await NotificationSchedulerService.scheduleDailyJobsForUser(userId, testDate);
      const hanafiAsrJob = await NotificationJob.findOne({
        userId,
        type: 'PRAYER_REMINDER',
        prayer: 'asr',
        targetDate: testDate,
      });

      // Change User A to Shafi'i
      await UserPreferences.updateOne({ userId }, { madhhab: 'shafii' });
      await NotificationSchedulerService.scheduleDailyJobsForUser(userId, testDate);
      const shafiiAsrJob = await NotificationJob.findOne({
        userId,
        type: 'PRAYER_REMINDER',
        prayer: 'asr',
        targetDate: testDate,
      });

      expect(hanafiAsrJob).toBeDefined();
      expect(shafiiAsrJob).toBeDefined();
      // Hanafi Asr time must be later than Shafi'i Asr time
      expect(hanafiAsrJob?.scheduledAt.getTime()).toBeGreaterThan(
        shafiiAsrJob!.scheduledAt.getTime()
      );
    });
  });

  describe('3. Dispatcher & Missed-Job Policy', () => {
    it('should skip stale jobs older than 15 minutes instead of spamming users', async () => {
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

      // Create an overdue job from 30 minutes ago
      await NotificationJob.create({
        userId,
        type: 'PRAYER_REMINDER',
        prayer: 'fajr',
        targetDate: '2026-08-31',
        targetTime: '05:00',
        timezone: 'Asia/Kolkata',
        scheduledAt: thirtyMinsAgo,
        status: 'PENDING',
        idempotencyKey: `${userId}_PRAYER_REMINDER_fajr_stale_test`,
        payload: {
          title: 'Fajr Prayer',
          body: 'Time for prayer',
          url: '/tracker',
        },
      });

      const dispatchResult = await NotificationSchedulerService.dispatchDueJobs();
      expect(dispatchResult.skipped).toBe(1);

      const jobInDb = await NotificationJob.findOne({
        idempotencyKey: `${userId}_PRAYER_REMINDER_fajr_stale_test`,
      });
      expect(jobInDb?.status).toBe('SKIPPED');
      expect(jobInDb?.failureReason).toContain('Missed execution window');
    });

    it('should dispatch test notification safely', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/test')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('4. Security & User Isolation', () => {
    it('should reject unauthenticated access to notification endpoints', async () => {
      const res1 = await request(app).get('/api/v1/notifications/status');
      expect(res1.status).toBe(401);

      const res2 = await request(app).get('/api/v1/notifications/preferences');
      expect(res2.status).toBe(401);

      const res3 = await request(app).post('/api/v1/notifications/subscribe');
      expect(res3.status).toBe(401);
    });

    it('should isolate notification subscriptions and preferences between User A and User B', async () => {
      // User A subscribes
      await request(app)
        .post('/api/v1/notifications/subscribe')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          endpoint: 'https://fcm.googleapis.com/fcm/send/user-a-device',
          keys: { p256dh: 'user-a-p256dh', auth: 'user-a-auth' },
        });

      // User B status check
      const resB = await request(app)
        .get('/api/v1/notifications/status')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(resB.status).toBe(200);
      expect(resB.body.data.hasActiveSubscription).toBe(false); // User B has 0 subscriptions
    });
  });
});
