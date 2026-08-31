import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { TrackerService } from '../services/tracker.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class TrackerController {
  static async getDailyTracker(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const records = await TrackerService.getDailyRecords(req.user!.id, date);
      res.status(200).json(sendSuccess({ date, records }));
    } catch (err) {
      next(err);
    }
  }

  static async updatePrayerStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await TrackerService.upsertPrayerStatus(req.user!.id, req.body);
      res.status(200).json(sendSuccess({ record }));
    } catch (err) {
      next(err);
    }
  }

  static async bulkSyncTracker(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TrackerService.bulkSync(req.user!.id, req.body.records);
      res.status(200).json(sendSuccess(result));
    } catch (err) {
      next(err);
    }
  }

  static async undoPrayerStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { localDate, prayer } = req.body;
      const result = await TrackerService.undoStatus(req.user!.id, localDate, prayer);
      res.status(200).json(sendSuccess(result));
    } catch (err) {
      next(err);
    }
  }
}
