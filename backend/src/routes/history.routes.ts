import { Router } from 'express';
import { HistoryController } from '../controllers/history.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

export const historyRouter = Router();

// All history endpoints require authentication
historyRouter.use(authenticateToken);

historyRouter.get('/summary', HistoryController.getSummary);
historyRouter.get('/monthly', HistoryController.getMonthly);
historyRouter.get('/heatmap', HistoryController.getHeatmap);
