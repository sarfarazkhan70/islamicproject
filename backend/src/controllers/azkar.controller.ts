import { Request, Response, NextFunction } from 'express';
import { AzkarService } from '../services/azkar.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class AzkarController {
  static getCategories(_req: Request, res: Response, next: NextFunction): void {
    try {
      const categories = AzkarService.getCategories();
      res.status(200).json(sendSuccess({ categories }));
    } catch (err) {
      next(err);
    }
  }

  static getItems(req: Request, res: Response, next: NextFunction): void {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const items = AzkarService.getItems(category, search);
      res.status(200).json(sendSuccess({ items }));
    } catch (err) {
      next(err);
    }
  }

  static async getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id || (req as any).user.userId;
      const favorites = await AzkarService.getFavorites(userId);
      res.status(200).json(sendSuccess({ favorites }));
    } catch (err) {
      next(err);
    }
  }

  static async toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id || (req as any).user.userId;
      const { azkarId } = req.body;
      const result = await AzkarService.toggleFavorite(userId, azkarId);
      res.status(200).json(sendSuccess(result));
    } catch (err) {
      next(err);
    }
  }
}
