import { Router } from 'express';
import { QazaController } from '../controllers/qaza.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { updateQazaCountsSchema, incrementQazaSchema, repayQazaSchema, updateDailyTargetSchema, } from '../validators/qaza.validators.js';
export const qazaRouter = Router();
// All Qaza endpoints require authentication
qazaRouter.use(authenticateToken);
qazaRouter.get('/', QazaController.getSummary);
qazaRouter.put('/', validateRequest(updateQazaCountsSchema), QazaController.updateCounts);
qazaRouter.post('/increment', validateRequest(incrementQazaSchema), QazaController.incrementCount);
qazaRouter.post('/repay', validateRequest(repayQazaSchema), QazaController.repayQaza);
qazaRouter.get('/logs', QazaController.getLogs);
qazaRouter.put('/target', validateRequest(updateDailyTargetSchema), QazaController.updateDailyTarget);
