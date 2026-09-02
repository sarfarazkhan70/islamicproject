import { CalendarService } from '../services/calendar.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
export class CalendarController {
    static getHijriDate(req, res, next) {
        try {
            const dateStr = req.query.date || new Date().toISOString();
            const adjustment = parseInt(req.query.adjustment || '0', 10);
            const timezone = req.query.timezone || undefined;
            const lat = req.query.latitude ? parseFloat(req.query.latitude) : undefined;
            const lng = req.query.longitude ? parseFloat(req.query.longitude) : undefined;
            const location = lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)
                ? { latitude: lat, longitude: lng }
                : undefined;
            const hijri = CalendarService.toHijri(dateStr, isNaN(adjustment) ? 0 : adjustment, timezone, location);
            res.status(200).json(sendSuccess({ hijri }));
        }
        catch (err) {
            res.status(400).json(sendError('CALENDAR_ERROR', err.message));
        }
    }
    static getGregorianDate(req, res, next) {
        try {
            const year = parseInt(req.query.year, 10);
            const month = parseInt(req.query.month, 10);
            const day = parseInt(req.query.day, 10);
            const adjustment = parseInt(req.query.adjustment || '0', 10);
            if (isNaN(year) || isNaN(month) || isNaN(day)) {
                res.status(400).json(sendError('INVALID_HIJRI_DATE', 'Valid year, month, and day are required.'));
                return;
            }
            const gregorian = CalendarService.toGregorian(year, month, day, isNaN(adjustment) ? 0 : adjustment);
            res.status(200).json(sendSuccess({ gregorian }));
        }
        catch (err) {
            res.status(400).json(sendError('CALENDAR_ERROR', err.message));
        }
    }
    static getMonthlyGrid(req, res, next) {
        try {
            const now = new Date();
            const year = parseInt(req.query.year || String(now.getFullYear()), 10);
            const month = parseInt(req.query.month || String(now.getMonth() + 1), 10);
            const adjustment = parseInt(req.query.adjustment || '0', 10);
            const grid = CalendarService.getMonthlyGrid(year, month, isNaN(adjustment) ? 0 : adjustment);
            res.status(200).json(sendSuccess({ grid }));
        }
        catch (err) {
            res.status(400).json(sendError('CALENDAR_ERROR', err.message));
        }
    }
    static getEvents(_req, res, next) {
        try {
            const events = CalendarService.getEvents();
            res.status(200).json(sendSuccess({ events }));
        }
        catch (err) {
            next(err);
        }
    }
}
