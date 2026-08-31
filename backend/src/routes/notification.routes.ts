import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  subscribePushSchema,
  unsubscribePushSchema,
  updateNotificationPreferencesSchema,
} from '../validators/notification.validators.js';

export const notificationRouter = Router();

// All notification routes require authentication
notificationRouter.use(authenticateToken);

notificationRouter.get('/status', NotificationController.getStatus);
notificationRouter.get('/preferences', NotificationController.getPreferences);
notificationRouter.patch(
  '/preferences',
  validate(updateNotificationPreferencesSchema),
  NotificationController.updatePreferences
);
notificationRouter.post(
  '/subscribe',
  validate(subscribePushSchema),
  NotificationController.subscribe
);
notificationRouter.post(
  '/unsubscribe',
  validate(unsubscribePushSchema),
  NotificationController.unsubscribe
);
notificationRouter.post('/test', NotificationController.sendTest);
