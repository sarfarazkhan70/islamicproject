import { Router } from 'express';
import { TrackerController } from '../controllers/tracker.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { updatePrayerStatusSchema, bulkSyncTrackerSchema, getTrackerByDateSchema, } from '../validators/tracker.validators.js';
export const trackerRouter = Router();
// All tracker endpoints require authentication
trackerRouter.use(authenticateToken);
trackerRouter.get('/', validateRequest(getTrackerByDateSchema), TrackerController.getDailyTracker);
trackerRouter.post('/', validateRequest(updatePrayerStatusSchema), TrackerController.updatePrayerStatus);
trackerRouter.post('/bulk', validateRequest(bulkSyncTrackerSchema), TrackerController.bulkSyncTracker);
trackerRouter.delete('/', TrackerController.undoPrayerStatus);
