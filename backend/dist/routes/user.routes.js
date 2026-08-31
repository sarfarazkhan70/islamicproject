import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { updatePreferencesSchema } from '../validators/user.validators.js';
export const userRouter = Router();
// All user routes require authentication
userRouter.use(requireAuth);
userRouter.get('/', UserController.getProfile);
userRouter.get('/preferences', UserController.getPreferences);
userRouter.put('/preferences', validate(updatePreferencesSchema), UserController.updatePreferences);
userRouter.patch('/preferences', validate(updatePreferencesSchema), UserController.updatePreferences);
