import { Request, Response, NextFunction } from 'express';
import { RamadanService } from '../services/ramadan.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class RamadanController {
  static async getFastingRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id || (req as any).user.userId;
      const hijriYear = req.query.hijriYear ? parseInt(req.query.hijriYear as string, 10) : undefined;

      const records = await RamadanService.getFastingRecords(userId, hijriYear);
      res.status(200).json(sendSuccess({ records }));
    } catch (err) {
      next(err);
    }
  }

  static async updateFastingRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id || (req as any).user.userId;
      const { localDate, hijriYear, ramadanDay, status, notes } = req.body;

      const record = await RamadanService.updateFastingRecord(
        userId,
        localDate,
        hijriYear,
        ramadanDay,
        status,
        notes
      );
      res.status(200).json(sendSuccess({ record }));
    } catch (err) {
      next(err);
    }
  }

  static async getKhatamProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id || (req as any).user.userId;
      const hijriYear = parseInt((req.query.hijriYear as string) || '1448', 10);

      const progress = await RamadanService.getKhatamProgress(userId, hijriYear);
      res.status(200).json(sendSuccess({ progress }));
    } catch (err) {
      next(err);
    }
  }

  static async updateKhatamProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id || (req as any).user.userId;
      const { hijriYear, completedJuz, notes } = req.body;

      const progress = await RamadanService.updateKhatamProgress(
        userId,
        hijriYear,
        completedJuz,
        notes
      );
      res.status(200).json(sendSuccess({ progress }));
    } catch (err) {
      next(err);
    }
  }
}
