import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from '../validators/auth.validators.js';

export const authRouter = Router();

// Traditional Email/Password Auth Routes (Preserved for compatibility)
authRouter.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  AuthController.register
);

authRouter.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  AuthController.login
);

authRouter.post(
  '/refresh',
  validate(refreshSchema),
  AuthController.refresh
);

authRouter.post('/logout', AuthController.logout);

authRouter.get('/me', requireAuth, AuthController.me);
