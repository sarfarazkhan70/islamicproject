import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { QazaService } from '../services/qaza.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class QazaController {
  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await QazaService.getOrCreateSummary(req.user!.id);
      res.status(200).json(sendSuccess({ summary }));
    } catch (err) {
      next(err);
    }
  }

  static async updateCounts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await QazaService.updateCounts(req.user!.id, req.body);
      res.status(200).json(sendSuccess({ summary }));
    } catch (err) {
      next(err);
    }
  }

  static async incrementCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prayer, amount } = req.body;
      const summary = await QazaService.incrementCount(req.user!.id, prayer, amount);
      res.status(200).json(sendSuccess({ summary }));
    } catch (err) {
      next(err);
    }
  }

  static async repayQaza(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prayer, quantity, localDate } = req.body;
      const result = await QazaService.repayQaza(req.user!.id, prayer, quantity, localDate);
      res.status(200).json(sendSuccess(result));
    } catch (err) {
      next(err);
    }
  }

  static async getLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 30;
      const logs = await QazaService.getLogs(req.user!.id, limit);
      res.status(200).json(sendSuccess({ logs }));
    } catch (err) {
      next(err);
    }
  }

  static async updateDailyTarget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await QazaService.updateTarget(req.user!.id, req.body.target);
      res.status(200).json(sendSuccess({ summary }));
    } catch (err) {
      next(err);
    }
  }
}
