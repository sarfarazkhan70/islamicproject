import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';
export async function requireAuth(req, res, next) {
    try {
        let token;
        // Check Authorization Header: Bearer <token>
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        else if (req.cookies && req.cookies.access_token) {
            token = req.cookies.access_token;
        }
        if (!token) {
            res.status(401).json(sendError('UNAUTHORIZED', 'Authentication token required'));
            return;
        }
        const payload = verifyAccessToken(token);
        if (!payload || !payload.userId) {
            res.status(401).json(sendError('INVALID_TOKEN', 'Invalid or expired access token'));
            return;
        }
        const user = await User.findById(payload.userId);
        if (!user || !user.isActive) {
            res.status(401).json(sendError('USER_NOT_FOUND', 'User account not found or deactivated'));
            return;
        }
        req.user = {
            id: user._id.toString(),
            _id: user._id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            isAnonymous: user.isAnonymous,
            isActive: user.isActive,
        };
        next();
    }
    catch (error) {
        next(error);
    }
}
export const authenticateToken = requireAuth;
