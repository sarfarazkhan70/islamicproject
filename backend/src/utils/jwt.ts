import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env.js';
import { TokenPayload } from '../types/auth.types.js';

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: (ENV.JWT_ACCESS_EXPIRES_IN || '15m') as SignOptions['expiresIn'],
    issuer: 'islamic-prayer-api',
    audience: 'islamic-prayer-client',
    jwtid: crypto.randomUUID(),
  };
  return jwt.sign(payload, ENV.JWT_SECRET, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: (ENV.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
    issuer: 'islamic-prayer-api',
    audience: 'islamic-prayer-client',
    jwtid: crypto.randomUUID(),
  };
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ENV.JWT_SECRET, {
      issuer: 'islamic-prayer-api',
      audience: 'islamic-prayer-client',
    }) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET, {
      issuer: 'islamic-prayer-api',
      audience: 'islamic-prayer-client',
    }) as TokenPayload;
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
