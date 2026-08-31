import { HistoryService } from '../services/history.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
export class HistoryController {
    static async getSummary(req, res, next) {
        try {
            const stats = await HistoryService.getOverallSummary(req.user.id);
            res.status(200).json(sendSuccess({ stats }));
        }
        catch (err) {
            next(err);
        }
    }
    static async getMonthly(req, res, next) {
        try {
            const now = new Date();
            const year = parseInt(req.query.year) || now.getFullYear();
            const month = parseInt(req.query.month) || now.getMonth() + 1;
            const data = await HistoryService.getMonthlyBreakdown(req.user.id, year, month);
            res.status(200).json(sendSuccess(data));
        }
        catch (err) {
            next(err);
        }
    }
    static async getHeatmap(req, res, next) {
        try {
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const data = await HistoryService.getYearlyHeatmap(req.user.id, year);
            res.status(200).json(sendSuccess(data));
        }
        catch (err) {
            next(err);
        }
    }
}
