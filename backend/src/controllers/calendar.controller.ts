import { Request, Response, NextFunction } from 'express';
import { CalendarService } from '../services/calendar.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class CalendarController {
  static getHijriDate(req: Request, res: Response, next: NextFunction): void {
    try {
      const dateStr = (req.query.date as string) || new Date().toISOString().slice(0, 10);
      const adjustment = parseInt((req.query.adjustment as string) || '0', 10);

      const hijri = CalendarService.toHijri(dateStr, isNaN(adjustment) ? 0 : adjustment);
      res.status(200).json(sendSuccess({ hijri }));
    } catch (err: any) {
      res.status(400).json(sendError('CALENDAR_ERROR', err.message));
    }
  }

  static getGregorianDate(req: Request, res: Response, next: NextFunction): void {
    try {
      const year = parseInt(req.query.year as string, 10);
      const month = parseInt(req.query.month as string, 10);
      const day = parseInt(req.query.day as string, 10);
      const adjustment = parseInt((req.query.adjustment as string) || '0', 10);

      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        res.status(400).json(sendError('INVALID_HIJRI_DATE', 'Valid year, month, and day are required.'));
        return;
      }

      const gregorian = CalendarService.toGregorian(year, month, day, isNaN(adjustment) ? 0 : adjustment);
      res.status(200).json(sendSuccess({ gregorian }));
    } catch (err: any) {
      res.status(400).json(sendError('CALENDAR_ERROR', err.message));
    }
  }

  static getMonthlyGrid(req: Request, res: Response, next: NextFunction): void {
    try {
      const now = new Date();
      const year = parseInt((req.query.year as string) || String(now.getFullYear()), 10);
      const month = parseInt((req.query.month as string) || String(now.getMonth() + 1), 10);
      const adjustment = parseInt((req.query.adjustment as string) || '0', 10);

      const grid = CalendarService.getMonthlyGrid(year, month, isNaN(adjustment) ? 0 : adjustment);
      res.status(200).json(sendSuccess({ grid }));
    } catch (err: any) {
      res.status(400).json(sendError('CALENDAR_ERROR', err.message));
    }
  }

  static getEvents(_req: Request, res: Response, next: NextFunction): void {
    try {
      const events = CalendarService.getEvents();
      res.status(200).json(sendSuccess({ events }));
    } catch (err) {
      next(err);
    }
  }
}
