import { UserPreferences } from '../models/UserPreferences.js';
import { NotificationJob } from '../models/NotificationJob.js';
import { calculatePrayerTimes } from './prayerEngine/prayerEngine.js';
import { localTimeToUtcDate } from '../utils/timezone.js';
import { WebPushService } from './webPush.service.js';
export class NotificationSchedulerService {
    /**
     * Generates or updates all deterministic notification jobs for a user on a given local date.
     * Fully idempotent: calling multiple times will not create duplicates.
     */
    static async scheduleDailyJobsForUser(userId, targetDateStr) {
        const prefs = await UserPreferences.findOne({ userId });
        if (!prefs)
            return 0;
        const timezone = prefs.location?.timezone || 'UTC';
        const dateStr = targetDateStr || new Date().toLocaleString('en-CA', { timeZone: timezone }).slice(0, 10);
        // If master notifications disabled, cancel pending jobs for date
        if (!prefs.notifications?.enabled) {
            await NotificationJob.deleteMany({
                userId,
                targetDate: dateStr,
                status: 'PENDING',
            });
            return 0;
        }
        const [y, m, d] = dateStr.split('-').map(Number);
        const localDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
        // Calculate astronomical prayer times for the user
        const [longitude, latitude] = prefs.location?.coordinates || [39.8262, 21.4225];
        const calcMethod = (prefs.calculationMethod === 'Makkah' ? 'UmmAlQura' : prefs.calculationMethod);
        const timetable = calculatePrayerTimes({
            date: localDate,
            latitude,
            longitude,
            timezone,
            options: {
                madhhab: prefs.madhhab,
                calculationMethod: calcMethod,
                highLatitudeRule: prefs.highLatitudeRule,
                timeFormat: prefs.timeFormat,
            },
        });
        let scheduledCount = 0;
        // 1. Prayer Reminders (Fajr, Zuhr, Asr, Maghrib, Isha)
        if (prefs.notifications.prayerReminders?.enabled) {
            const prayers = [
                'fajr',
                'zuhr',
                'asr',
                'maghrib',
                'isha',
            ];
            const leadMinutes = prefs.notifications.prayerReminders.leadTimeMinutes || 0;
            for (const prayer of prayers) {
                const isPrayerEnabled = prefs.notifications.prayerReminders[prayer];
                const idempotencyKey = `${userId}_PRAYER_REMINDER_${prayer}_${dateStr}`;
                if (!isPrayerEnabled) {
                    await NotificationJob.deleteOne({ idempotencyKey, status: 'PENDING' });
                    continue;
                }
                const slot = timetable.prayers.find((p) => p.key === prayer);
                if (!slot)
                    continue;
                const time24 = slot.time24Formatted || '12:00';
                const scheduledAt = new Date(slot.date.getTime() - leadMinutes * 60 * 1000);
                const prayerNameCapitalized = prayer.charAt(0).toUpperCase() + prayer.slice(1);
                const title = `${prayerNameCapitalized} Prayer Reminder`;
                const body = leadMinutes > 0
                    ? `${prayerNameCapitalized} starts in ${leadMinutes} minutes (${slot.timeFormatted}).`
                    : `It is now time for ${prayerNameCapitalized} prayer (${slot.timeFormatted}).`;
                await NotificationJob.findOneAndUpdate({ idempotencyKey }, {
                    userId,
                    type: 'PRAYER_REMINDER',
                    prayer,
                    targetDate: dateStr,
                    targetTime: time24,
                    timezone,
                    scheduledAt,
                    status: 'PENDING',
                    payload: {
                        title,
                        body,
                        url: '/tracker',
                        tag: `prayer-${prayer}`,
                    },
                }, { upsert: true, new: true, setDefaultsOnInsert: true });
                scheduledCount++;
            }
        }
        // 2. Surah Al-Mulk 11:00 PM Reminder
        if (prefs.notifications.surahMulk11pm?.enabled) {
            const mulkTimeStr = prefs.notifications.surahMulk11pm.time || '23:00';
            const scheduledAt = localTimeToUtcDate(dateStr, mulkTimeStr, timezone);
            const idempotencyKey = `${userId}_SURAH_MULK_REMINDER_none_${dateStr}`;
            await NotificationJob.findOneAndUpdate({ idempotencyKey }, {
                userId,
                type: 'SURAH_MULK_REMINDER',
                targetDate: dateStr,
                targetTime: mulkTimeStr,
                timezone,
                scheduledAt,
                status: 'PENDING',
                payload: {
                    title: 'Surah Al-Mulk Reminder',
                    body: 'Have you read or listened to Surah Al-Mulk today?',
                    url: '/surah-al-mulk',
                    tag: 'surah-mulk',
                },
            }, { upsert: true, new: true, setDefaultsOnInsert: true });
            scheduledCount++;
        }
        else {
            const idempotencyKey = `${userId}_SURAH_MULK_REMINDER_none_${dateStr}`;
            await NotificationJob.deleteOne({ idempotencyKey, status: 'PENDING' });
        }
        // 3. Friday Surah Al-Kahf Reminder (1 Hour Before Configured Jumu'ah Time)
        // Check if date is Friday (5)
        const isFriday = localDate.getUTCDay() === 5;
        if (isFriday && prefs.notifications.fridayKahf?.enabled) {
            const jumuahTimeStr = prefs.notifications.jumuahTime || '13:30';
            const jumuahUtc = localTimeToUtcDate(dateStr, jumuahTimeStr, timezone);
            const leadMinutes = prefs.notifications.fridayKahf.leadTimeMinutes || 60;
            const scheduledAt = new Date(jumuahUtc.getTime() - leadMinutes * 60 * 1000);
            const idempotencyKey = `${userId}_JUMUAH_KAHF_REMINDER_none_${dateStr}`;
            await NotificationJob.findOneAndUpdate({ idempotencyKey }, {
                userId,
                type: 'JUMUAH_KAHF_REMINDER',
                targetDate: dateStr,
                targetTime: jumuahTimeStr,
                timezone,
                scheduledAt,
                status: 'PENDING',
                payload: {
                    title: 'Friday Jumu\'ah & Surah Al-Kahf',
                    body: 'Jumu\'ah is in 1 hour. Remember to recite Surah Al-Kahf and send blessings upon the Prophet ﷺ.',
                    url: '/jumuah',
                    tag: 'jumuah-kahf',
                },
            }, { upsert: true, new: true, setDefaultsOnInsert: true });
            scheduledCount++;
        }
        else {
            const idempotencyKey = `${userId}_JUMUAH_KAHF_REMINDER_none_${dateStr}`;
            await NotificationJob.deleteOne({ idempotencyKey, status: 'PENDING' });
        }
        return scheduledCount;
    }
    /**
     * Rebuilds all scheduled jobs for a user (called when preferences change)
     */
    static async rebuildUserSchedule(userId) {
        const prefs = await UserPreferences.findOne({ userId });
        if (!prefs)
            return;
        const timezone = prefs.location?.timezone || 'UTC';
        const todayStr = new Date().toLocaleString('en-CA', { timeZone: timezone }).slice(0, 10);
        // Calculate tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toLocaleString('en-CA', { timeZone: timezone }).slice(0, 10);
        await Promise.all([
            this.scheduleDailyJobsForUser(userId, todayStr),
            this.scheduleDailyJobsForUser(userId, tomorrowStr),
        ]);
    }
    /**
     * Dispatches all pending jobs that are due for delivery
     */
    static async dispatchDueJobs() {
        const now = new Date();
        const MISSED_WINDOW_MS = 15 * 60 * 1000; // 15 minutes missed job policy
        const pendingJobs = await NotificationJob.find({
            status: 'PENDING',
            scheduledAt: { $lte: now },
        }).limit(100);
        let delivered = 0;
        let failed = 0;
        let skipped = 0;
        for (const job of pendingJobs) {
            // Check missed job policy
            const elapsedMs = now.getTime() - job.scheduledAt.getTime();
            if (elapsedMs > MISSED_WINDOW_MS) {
                job.status = 'SKIPPED';
                job.failureReason = `Missed execution window (${Math.round(elapsedMs / 60000)}m late)`;
                await job.save();
                skipped++;
                continue;
            }
            try {
                const result = await WebPushService.sendToUser(job.userId, {
                    title: job.payload.title,
                    body: job.payload.body,
                    url: job.payload.url,
                    tag: job.payload.tag,
                    type: job.type,
                }, job._id);
                job.sentAt = new Date();
                job.status = result.delivered > 0 || result.failed === 0 ? 'SENT' : 'FAILED';
                if (result.failed > 0 && result.delivered === 0) {
                    job.failureReason = 'Delivery failed on all user devices';
                }
                await job.save();
                if (job.status === 'SENT')
                    delivered++;
                else
                    failed++;
            }
            catch (err) {
                job.status = 'FAILED';
                job.failureReason = err.message || 'Unknown dispatch error';
                await job.save();
                failed++;
            }
        }
        return {
            processed: pendingJobs.length,
            delivered,
            failed,
            skipped,
        };
    }
    /**
     * Send test notification for development and permission verification
     */
    static async sendTestNotification(userId) {
        const result = await WebPushService.sendToUser(userId, {
            title: 'Islamic Prayer — Test Notification',
            body: 'Notifications are working perfectly! You will receive timely prayer and Surah reminders.',
            url: '/notifications',
            type: 'TEST_NOTIFICATION',
            tag: 'test-notification',
        });
        return {
            delivered: result.delivered,
            failed: result.failed,
        };
    }
}
