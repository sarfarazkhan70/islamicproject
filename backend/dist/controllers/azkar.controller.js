import { AzkarService } from '../services/azkar.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
export class AzkarController {
    static getCategories(_req, res, next) {
        try {
            const categories = AzkarService.getCategories();
            res.status(200).json(sendSuccess({ categories }));
        }
        catch (err) {
            next(err);
        }
    }
    static getItems(req, res, next) {
        try {
            const category = req.query.category;
            const search = req.query.search;
            const items = AzkarService.getItems(category, search);
            res.status(200).json(sendSuccess({ items }));
        }
        catch (err) {
            next(err);
        }
    }
    static async getFavorites(req, res, next) {
        try {
            const userId = req.user.id || req.user._id || req.user.userId;
            const favorites = await AzkarService.getFavorites(userId);
            res.status(200).json(sendSuccess({ favorites }));
        }
        catch (err) {
            next(err);
        }
    }
    static async toggleFavorite(req, res, next) {
        try {
            const userId = req.user.id || req.user._id || req.user.userId;
            const { azkarId } = req.body;
            const result = await AzkarService.toggleFavorite(userId, azkarId);
            res.status(200).json(sendSuccess(result));
        }
        catch (err) {
            next(err);
        }
    }
}
