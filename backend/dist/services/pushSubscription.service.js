import { PushSubscription } from '../models/PushSubscription.js';
import { UserPreferences } from '../models/UserPreferences.js';
import { NotificationSchedulerService } from './notificationScheduler.service.js';
import { WebPushService } from './webPush.service.js';
export class PushSubscriptionService {
    /**
     * Register or update a browser push subscription for a user
     */
    static async subscribe(userId, subscriptionData) {
        const subscription = await PushSubscription.findOneAndUpdate({ userId, endpoint: subscriptionData.endpoint }, {
            userId,
            endpoint: subscriptionData.endpoint,
            keys: subscriptionData.keys,
            device: subscriptionData.device,
            isActive: true,
            lastUsedAt: new Date(),
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        // Automatically rebuild schedules for this user
        await NotificationSchedulerService.rebuildUserSchedule(userId);
        return subscription;
    }
    /**
     * Unsubscribe / deactivate a push subscription
     */
    static async unsubscribe(userId, endpoint) {
        const result = await PushSubscription.findOneAndUpdate({ userId, endpoint }, { isActive: false });
        return !!result;
    }
    /**
     * Get subscription status for a user
     */
    static async getStatus(userId) {
        const activeCount = await PushSubscription.countDocuments({
            userId,
            isActive: true,
        });
        return {
            hasActiveSubscription: activeCount > 0,
            activeDeviceCount: activeCount,
            vapidPublicKey: WebPushService.getPublicKey(),
        };
    }
    /**
     * Get user's notification preferences
     */
    static async getPreferences(userId) {
        const prefs = await UserPreferences.findOne({ userId });
        if (!prefs) {
            throw new Error('User preferences not found');
        }
        return prefs.notifications;
    }
    /**
     * Update user's notification preferences and rebuild future jobs
     */
    static async updatePreferences(userId, updates) {
        const prefs = await UserPreferences.findOne({ userId });
        if (!prefs) {
            throw new Error('User preferences not found');
        }
        // Deep merge notification settings
        if (updates.enabled !== undefined)
            prefs.notifications.enabled = updates.enabled;
        if (updates.jumuahTime !== undefined)
            prefs.notifications.jumuahTime = updates.jumuahTime;
        if (updates.soundEnabled !== undefined)
            prefs.notifications.soundEnabled = updates.soundEnabled;
        if (updates.prayerReminders) {
            prefs.notifications.prayerReminders = {
                ...prefs.notifications.prayerReminders,
                ...updates.prayerReminders,
            };
        }
        if (updates.surahMulk11pm) {
            prefs.notifications.surahMulk11pm = {
                ...prefs.notifications.surahMulk11pm,
                ...updates.surahMulk11pm,
            };
        }
        if (updates.fridayKahf) {
            prefs.notifications.fridayKahf = {
                ...prefs.notifications.fridayKahf,
                ...updates.fridayKahf,
            };
        }
        await prefs.save();
        // Rebuild future notification schedules to reflect preference updates
        await NotificationSchedulerService.rebuildUserSchedule(userId);
        return prefs.notifications;
    }
}
