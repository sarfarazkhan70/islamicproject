import { AuthService } from '../services/auth.service.js';
import { UserService } from '../services/user.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ENV } from '../config/env.js';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
export class AuthController {
    static async register(req, res, next) {
        try {
            const { user, tokens } = await AuthService.registerUser(req.body);
            const preferences = await UserService.getUserPreferences(user._id.toString());
            res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTIONS);
            res.status(201).json(sendSuccess({
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    phone: user.phone,
                    name: user.name,
                    isAnonymous: user.isAnonymous,
                    createdAt: user.createdAt,
                },
                preferences,
                tokens,
            }));
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { user, tokens } = await AuthService.loginUser(req.body);
            const preferences = await UserService.getUserPreferences(user._id.toString());
            res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTIONS);
            res.status(200).json(sendSuccess({
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    phone: user.phone,
                    name: user.name,
                    isAnonymous: user.isAnonymous,
                    createdAt: user.createdAt,
                },
                preferences,
                tokens,
            }));
        }
        catch (error) {
            next(error);
        }
    }
    static async refresh(req, res, next) {
        try {
            const rawToken = req.body?.refreshToken || req.cookies?.refresh_token;
            if (!rawToken) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'REFRESH_TOKEN_REQUIRED',
                        message: 'Refresh token must be provided in request body or cookie.',
                    },
                });
                return;
            }
            const newTokens = await AuthService.refreshAccessToken(rawToken);
            res.cookie('refresh_token', newTokens.refreshToken, COOKIE_OPTIONS);
            res.status(200).json(sendSuccess({ tokens: newTokens }));
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            const rawToken = req.body?.refreshToken || req.cookies?.refresh_token;
            await AuthService.logoutUser(rawToken);
            res.clearCookie('refresh_token', {
                httpOnly: true,
                secure: ENV.NODE_ENV === 'production',
                sameSite: 'lax',
            });
            res.status(200).json(sendSuccess({ message: 'Successfully logged out.' }));
        }
        catch (error) {
            next(error);
        }
    }
    static async me(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'User is not authenticated',
                    },
                });
                return;
            }
            const user = await UserService.getUserProfile(req.user.id);
            const preferences = await UserService.getUserPreferences(req.user.id);
            res.status(200).json(sendSuccess({
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    phone: user.phone,
                    name: user.name,
                    isAnonymous: user.isAnonymous,
                    createdAt: user.createdAt,
                },
                preferences,
            }));
        }
        catch (error) {
            next(error);
        }
    }
}
