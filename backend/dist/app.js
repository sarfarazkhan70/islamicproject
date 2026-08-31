import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { v1Router } from './routes/index.js';
import { generalLimiter } from './middleware/rateLimiter.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { ENV } from './config/env.js';
export function createApp() {
    const app = express();
    // Security Headers
    app.use(helmet());
    // CORS Configuration
    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
            if (!origin)
                return callback(null, true);
            if (origin === ENV.FRONTEND_URL || ENV.NODE_ENV !== 'production') {
                return callback(null, true);
            }
            return callback(new Error('Blocked by CORS policy'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));
    // Request Parsing & Limits
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cookieParser());
    // Global Rate Limiting
    app.use('/api', generalLimiter);
    // API v1 Routing
    app.use('/api/v1', v1Router);
    // 404 Route Handler
    app.use(notFoundHandler);
    // Centralized Error Handler
    app.use(errorHandler);
    return app;
}
export const app = createApp();
