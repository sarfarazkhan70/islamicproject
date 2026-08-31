import { User } from '../models/User.js';
import { UserPreferences } from '../models/UserPreferences.js';
import { AppError } from '../middleware/error.middleware.js';
import { NotificationSchedulerService } from './notificationScheduler.service.js';
export class UserService {
    /**
     * Get user account profile
     */
    static async getUserProfile(userId) {
        const user = await User.findById(userId);
        if (!user || !user.isActive) {
            throw new AppError('User not found or account deactivated.', 404, 'USER_NOT_FOUND');
        }
        return user;
    }
    /**
     * Get user preferences
     */
    static async getUserPreferences(userId) {
        let preferences = await UserPreferences.findOne({ userId });
        if (!preferences) {
            // Create fallback defaults if not found
            preferences = await UserPreferences.create({
                userId,
                location: {
                    type: 'Point',
                    coordinates: [39.8262, 21.4225],
                    city: 'Makkah',
                    country: 'Saudi Arabia',
                    timezone: 'Asia/Riyadh',
                    isAutoDetected: true,
                },
                madhhab: 'hanafi',
                calculationMethod: 'Karachi',
                highLatitudeRule: 'TwilightAngle',
                timeFormat: '12h',
                theme: 'emerald-dark',
                adhanSound: 'makkah',
                hijriDateAdjustment: 0,
            });
        }
        return preferences;
    }
    /**
     * Update user preferences
     */
    static async updateUserPreferences(userId, updateData) {
        const updated = await UserPreferences.findOneAndUpdate({ userId }, { $set: updateData }, { new: true, upsert: true, runValidators: true });
        // Rebuild future notification schedules when preferences change
        await NotificationSchedulerService.rebuildUserSchedule(userId);
        return updated;
    }
}
