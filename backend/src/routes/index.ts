import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { userRouter } from './user.routes.js';
import { trackerRouter } from './tracker.routes.js';
import { qazaRouter } from './qaza.routes.js';
import { historyRouter } from './history.routes.js';
import { notificationRouter } from './notification.routes.js';
import { quranRoutes } from './quran.routes.js';
import { azkarRoutes } from './azkar.routes.js';
import { qiblaRoutes } from './qibla.routes.js';
import { calendarRoutes } from './calendar.routes.js';
import { ramadanRoutes } from './ramadan.routes.js';
import { quranApiRouter } from './quranApi.routes.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getDatabaseStatus } from '../config/database.js';
import { ENV } from '../config/env.js';

export const v1Router = Router();

// Health check endpoint
v1Router.get('/health', (_req, res) => {
  const dbStatus = getDatabaseStatus();
  res.status(200).json(
    sendSuccess({
      status: 'healthy',
      environment: ENV.NODE_ENV,
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  );
});

// Mounted Feature Routes
v1Router.use('/auth', authRouter);
v1Router.use('/user', userRouter);
v1Router.use('/tracker', trackerRouter);
v1Router.use('/qaza', qazaRouter);
v1Router.use('/history', historyRouter);
v1Router.use('/notifications', notificationRouter);
v1Router.use('/quran', quranRoutes);
v1Router.use('/quran-api', quranApiRouter);
v1Router.use('/azkar', azkarRoutes);
v1Router.use('/qibla', qiblaRoutes);
v1Router.use('/calendar', calendarRoutes);
v1Router.use('/ramadan', ramadanRoutes);

// Internal utility to save synthesized audio files
v1Router.post('/internal/save-prophet-audio', (req, res) => {
  try {
    const { id, base64 } = req.body;
    if (!id || !base64) {
      res.status(400).json({ error: 'Missing id or base64' });
      return;
    }
    const outDir = path.resolve(process.cwd(), '../frontend/public/audio/prophet');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const filePath = path.join(outDir, `${id}.mp3`);
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    res.json({ success: true, path: filePath });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
