import { Router } from 'express';
import { AzkarController } from '../controllers/azkar.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { toggleAzkarFavoriteSchema } from '../validators/azkar.validators.js';

const router = Router();

// Public routes
router.get('/categories', AzkarController.getCategories);
router.get('/items', AzkarController.getItems);

// Authenticated favorite routes
router.get('/favorites', requireAuth, AzkarController.getFavorites);
router.post(
  '/favorites',
  requireAuth,
  validate(toggleAzkarFavoriteSchema),
  AzkarController.toggleFavorite
);

export const azkarRoutes = router;
