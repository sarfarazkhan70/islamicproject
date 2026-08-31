import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env.js';
export function generateAccessToken(payload) {
    const options = {
        expiresIn: (ENV.JWT_ACCESS_EXPIRES_IN || '15m'),
        issuer: 'islamic-prayer-api',
        audience: 'islamic-prayer-client',
        jwtid: crypto.randomUUID(),
    };
    return jwt.sign(payload, ENV.JWT_SECRET, options);
}
export function generateRefreshToken(payload) {
    const options = {
        expiresIn: (ENV.JWT_REFRESH_EXPIRES_IN || '7d'),
        issuer: 'islamic-prayer-api',
        audience: 'islamic-prayer-client',
        jwtid: crypto.randomUUID(),
    };
    return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, options);
}
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, ENV.JWT_SECRET, {
            issuer: 'islamic-prayer-api',
            audience: 'islamic-prayer-client',
        });
    }
    catch {
        return null;
    }
}
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, ENV.JWT_REFRESH_SECRET, {
            issuer: 'islamic-prayer-api',
            audience: 'islamic-prayer-client',
        });
    }
    catch {
        return null;
    }
}
export function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
