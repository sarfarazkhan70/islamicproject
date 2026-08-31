import webpush from 'web-push';
import { ENV } from '../config/env.js';
import { PushSubscription } from '../models/PushSubscription.js';
import { NotificationLog } from '../models/NotificationLog.js';
import { NotificationType } from '../models/NotificationJob.js';
import mongoose from 'mongoose';

// Initialize VAPID details
if (ENV.VAPID_PUBLIC_KEY && ENV.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      ENV.VAPID_SUBJECT,
      ENV.VAPID_PUBLIC_KEY,
      ENV.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.error('Error setting VAPID details:', err);
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url: string;
  type: NotificationType;
  tag?: string;
  data?: Record<string, unknown>;
}

export interface SendResult {
  success: boolean;
  delivered: number;
  failed: number;
  expiredCount: number;
}

export class WebPushService {
  /**
   * Send push notification to all active devices of a user
   */
  static async sendToUser(
    userId: string | mongoose.Types.ObjectId,
    payload: PushNotificationPayload,
    jobId?: mongoose.Types.ObjectId
  ): Promise<SendResult> {
    const subscriptions = await PushSubscription.find({
      userId,
      isActive: true,
    });

    if (subscriptions.length === 0) {
      return { success: true, delivered: 0, failed: 0, expiredCount: 0 };
    }

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url,
      type: payload.type,
      tag: payload.tag || payload.type,
      data: payload.data || {},
    });

    let delivered = 0;
    let failed = 0;
    let expiredCount = 0;

    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        };

        await webpush.sendNotification(pushSubscription, payloadString);
        delivered++;

        // Update lastUsedAt
        sub.lastUsedAt = new Date();
        await sub.save();
      } catch (err: any) {
        failed++;
        // 404 Not Found or 410 Gone indicates the subscription is expired/unregistered
        if (err.statusCode === 404 || err.statusCode === 410) {
          sub.isActive = false;
          await sub.save();
          expiredCount++;
        }
      }
    }

    // Record delivery in audit log
    await NotificationLog.create({
      userId,
      jobId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      url: payload.url,
      status: delivered > 0 ? 'DELIVERED' : expiredCount > 0 ? 'EXPIRED_SUBSCRIPTION' : 'FAILED',
      deliveredCount: delivered,
      failedCount: failed,
      sentAt: new Date(),
    });

    return {
      success: delivered > 0 || failed === 0,
      delivered,
      failed,
      expiredCount,
    };
  }

  /**
   * Return public VAPID key
   */
  static getPublicKey(): string {
    return ENV.VAPID_PUBLIC_KEY;
  }
}
