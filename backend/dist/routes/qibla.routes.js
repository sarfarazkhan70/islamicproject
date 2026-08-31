import { Router } from 'express';
import { QiblaController } from '../controllers/qibla.controller.js';
const router = Router();
router.get('/calculate', QiblaController.calculate);
export const qiblaRoutes = router;
