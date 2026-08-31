import { PushSubscriptionService } from '../services/pushSubscription.service.js';
import { NotificationSchedulerService } from '../services/notificationScheduler.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
export class NotificationController {
    /**
     * GET /api/v1/notifications/status
     */
    static async getStatus(req, res, next) {
        try {
            const status = await PushSubscriptionService.getStatus(req.user.id);
            res.status(200).json(sendSuccess(status));
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * GET /api/v1/notifications/preferences
     */
    static async getPreferences(req, res, next) {
        try {
            const preferences = await PushSubscriptionService.getPreferences(req.user.id);
            res.status(200).json(sendSuccess({ preferences }));
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * PATCH /api/v1/notifications/preferences
     */
    static async updatePreferences(req, res, next) {
        try {
            const preferences = await PushSubscriptionService.updatePreferences(req.user.id, req.body);
            res.status(200).json(sendSuccess({ preferences }));
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * POST /api/v1/notifications/subscribe
     */
    static async subscribe(req, res, next) {
        try {
            const subscription = await PushSubscriptionService.subscribe(req.user.id, req.body);
            res.status(201).json(sendSuccess({ subscription }));
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * POST /api/v1/notifications/unsubscribe
     */
    static async unsubscribe(req, res, next) {
        try {
            const result = await PushSubscriptionService.unsubscribe(req.user.id, req.body.endpoint);
            res.status(200).json(sendSuccess({ unsubscribed: result }));
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * POST /api/v1/notifications/test
     * Safe development & verification test notification
     */
    static async sendTest(req, res, next) {
        try {
            const result = await NotificationSchedulerService.sendTestNotification(req.user.id);
            res.status(200).json(sendSuccess(result));
        }
        catch (err) {
            next(err);
        }
    }
}
