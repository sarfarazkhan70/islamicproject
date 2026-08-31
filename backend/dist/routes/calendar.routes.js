import { Router } from 'express';
import { CalendarController } from '../controllers/calendar.controller.js';
const router = Router();
router.get('/hijri', CalendarController.getHijriDate);
router.get('/gregorian', CalendarController.getGregorianDate);
router.get('/monthly', CalendarController.getMonthlyGrid);
router.get('/events', CalendarController.getEvents);
export const calendarRoutes = router;
