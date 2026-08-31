import { UserService } from '../services/user.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
export class UserController {
    static async getProfile(req, res, next) {
        try {
            const user = await UserService.getUserProfile(req.user.id);
            res.status(200).json(sendSuccess({ user }));
        }
        catch (error) {
            next(error);
        }
    }
    static async getPreferences(req, res, next) {
        try {
            const preferences = await UserService.getUserPreferences(req.user.id);
            res.status(200).json(sendSuccess({ preferences }));
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePreferences(req, res, next) {
        try {
            const updated = await UserService.updateUserPreferences(req.user.id, req.body);
            res.status(200).json(sendSuccess({
                message: 'Preferences updated successfully',
                preferences: updated,
            }));
        }
        catch (error) {
            next(error);
        }
    }
}
