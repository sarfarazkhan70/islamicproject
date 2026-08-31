import { Request, Response, NextFunction } from 'express';
import { QuranService } from '../services/quran.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class QuranController {
  static getSurahs(_req: Request, res: Response, next: NextFunction): void {
    try {
      const surahs = QuranService.getSurahs();
      res.status(200).json(sendSuccess({ surahs }));
    } catch (err) {
      next(err);
    }
  }

  static getJuzList(_req: Request, res: Response, next: NextFunction): void {
    try {
      const juzList = QuranService.getJuzList();
      res.status(200).json(sendSuccess({ juz: juzList }));
    } catch (err) {
      next(err);
    }
  }

  static async getSurahDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const surahNumber = parseInt(String(req.params.number), 10);
      if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        res.status(400).json(sendError('INVALID_SURAH_NUMBER', 'Surah number must be between 1 and 114.'));
        return;
      }

      const detail = await QuranService.getSurahDetail(surahNumber);
      res.status(200).json(sendSuccess({ surah: detail }));
    } catch (err: any) {
      if (err.message && err.message.includes('not found')) {
        res.status(404).json(sendError('SURAH_NOT_FOUND', err.message));
        return;
      }
      next(err);
    }
  }

  static search(req: Request, res: Response, next: NextFunction): void {
    try {
      const query = (req.query.q as string) || '';
      const results = QuranService.searchQuran(query);
      res.status(200).json(sendSuccess(results));
    } catch (err) {
      next(err);
    }
  }

  static async getBookmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id || (req as any).user.userId;
      const bookmarks = await QuranService.getBookmarks(userId);
      res.status(200).json(sendSuccess({ bookmarks }));
    } catch (err) {
      next(err);
    }
  }

  static async addBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id || (req as any).user.userId;
      const { surahNumber, ayahNumber, surahName, ayahText } = req.body;

      const bookmark = await QuranService.addBookmark(
        userId,
        surahNumber,
        ayahNumber,
        surahName,
        ayahText
      );
      res.status(201).json(sendSuccess({ bookmark }));
    } catch (err) {
      next(err);
    }
  }

  static async removeBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id || (req as any).user.userId;
      const { surahNumber, ayahNumber } = req.body;

      const removed = await QuranService.removeBookmark(userId, surahNumber, ayahNumber);
      res.status(200).json(sendSuccess({ removed }));
    } catch (err) {
      next(err);
    }
  }

  static async getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id || (req as any).user.userId;
      const progress = await QuranService.getProgress(userId);
      res.status(200).json(sendSuccess({ progress }));
    } catch (err) {
      next(err);
    }
  }

  static async updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id || (req as any).user.userId;
      const { surahNumber, ayahNumber, surahName, pageNumber } = req.body;

      const progress = await QuranService.updateProgress(
        userId,
        surahNumber,
        ayahNumber,
        surahName,
        pageNumber
      );
      res.status(200).json(sendSuccess({ progress }));
    } catch (err) {
      next(err);
    }
  }
}
