import { User } from '../models/User.js';
import { UserPreferences } from '../models/UserPreferences.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, hashToken, } from '../utils/jwt.js';
import { AppError } from '../middleware/error.middleware.js';
export class AuthService {
    /**
     * Register a new user and create default preferences
     */
    static async registerUser(data) {
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            throw new AppError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
        }
        const passwordHash = await hashPassword(data.password);
        const user = await User.create({
            email: data.email,
            passwordHash,
            isAnonymous: false,
            guestId: data.guestId,
            isActive: true,
        });
        // Create default user preferences
        await UserPreferences.create({
            userId: user._id,
            location: {
                type: 'Point',
                coordinates: [39.8262, 21.4225], // Makkah default
                city: 'Makkah',
                country: 'Saudi Arabia',
                timezone: 'Asia/Riyadh',
                isAutoDetected: true,
            },
            madhhab: 'hanafi',
            calculationMethod: 'Karachi',
            highLatitudeRule: 'TwilightAngle',
            timeFormat: '12h',
            theme: 'emerald-dark',
            adhanSound: 'makkah',
            hijriDateAdjustment: 0,
        });
        const tokens = await this.issueTokens(user);
        return { user, tokens };
    }
    /**
     * Authenticate user by email and password
     */
    static async loginUser(data) {
        const user = await User.findOne({ email: data.email }).select('+passwordHash');
        if (!user || !user.passwordHash || !user.isActive) {
            throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
        }
        const isMatch = await comparePassword(data.password, user.passwordHash);
        if (!isMatch) {
            throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
        }
        const tokens = await this.issueTokens(user);
        return { user, tokens };
    }
    /**
     * Rotate and refresh access token using valid refresh token
     */
    static async refreshAccessToken(rawRefreshToken) {
        const payload = verifyRefreshToken(rawRefreshToken);
        if (!payload || !payload.userId) {
            throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN');
        }
        const tokenHash = hashToken(rawRefreshToken);
        const storedToken = await RefreshToken.findOne({ tokenHash });
        if (!storedToken) {
            throw new AppError('Refresh token revoked or not recognized.', 401, 'REFRESH_TOKEN_NOT_FOUND');
        }
        // Token Reuse Detection: If a revoked token is presented, revoke all active sessions for security
        if (storedToken.isRevoked) {
            await RefreshToken.updateMany({ userId: storedToken.userId }, { isRevoked: true });
            throw new AppError('Compromised token detected. All sessions terminated for security.', 401, 'TOKEN_REUSE_DETECTED');
        }
        if (storedToken.expiresAt < new Date()) {
            throw new AppError('Refresh token expired, please log in again.', 401, 'REFRESH_TOKEN_EXPIRED');
        }
        const user = await User.findById(payload.userId);
        if (!user || !user.isActive) {
            throw new AppError('User not found or account deactivated.', 401, 'USER_NOT_FOUND');
        }
        // Issue new tokens & rotate old token
        const newTokens = await this.issueTokens(user);
        storedToken.isRevoked = true;
        storedToken.replacedByTokenHash = hashToken(newTokens.refreshToken);
        await storedToken.save();
        return newTokens;
    }
    /**
     * Revoke refresh token on logout
     */
    static async logoutUser(rawRefreshToken) {
        if (!rawRefreshToken)
            return;
        const tokenHash = hashToken(rawRefreshToken);
        await RefreshToken.findOneAndUpdate({ tokenHash }, { isRevoked: true });
    }
    /**
     * Helper to generate and persist tokens
     */
    static async issueTokens(user) {
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            phone: user.phone,
            isAnonymous: user.isAnonymous,
        };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        const refreshTokenHash = hashToken(refreshToken);
        // Refresh token expiry calculation (7 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshToken.create({
            userId: user._id,
            tokenHash: refreshTokenHash,
            expiresAt,
            isRevoked: false,
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: '15m',
        };
    }
}
