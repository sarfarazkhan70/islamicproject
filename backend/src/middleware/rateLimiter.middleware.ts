import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

export const generalLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: sendError('TOO_MANY_REQUESTS', 'Too many requests from this IP, please try again later.'),
  skip: () => process.env.NODE_ENV === 'test' || ENV.NODE_ENV === 'test',
});

export const authLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: sendError('TOO_MANY_AUTH_ATTEMPTS', 'Too many authentication attempts, please try again after 15 minutes.'),
  skip: () => process.env.NODE_ENV === 'test' || ENV.NODE_ENV === 'test',
});
