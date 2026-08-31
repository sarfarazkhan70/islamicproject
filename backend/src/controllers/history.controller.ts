import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { HistoryService } from '../services/history.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class HistoryController {
  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await HistoryService.getOverallSummary(req.user!.id);
      res.status(200).json(sendSuccess({ stats }));
    } catch (err) {
      next(err);
    }
  }

  static async getMonthly(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const now = new Date();
      const year = parseInt(req.query.year as string) || now.getFullYear();
      const month = parseInt(req.query.month as string) || now.getMonth() + 1;
      const data = await HistoryService.getMonthlyBreakdown(req.user!.id, year, month);
      res.status(200).json(sendSuccess(data));
    } catch (err) {
      next(err);
    }
  }

  static async getHeatmap(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const data = await HistoryService.getYearlyHeatmap(req.user!.id, year);
      res.status(200).json(sendSuccess(data));
    } catch (err) {
      next(err);
    }
  }
}
