import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { ENV } from './config/env.js';
import { NotificationSchedulerService } from './services/notificationScheduler.service.js';
let schedulerInterval = null;
async function bootstrap() {
    try {
        console.log(`[Islamic Prayer Backend] Initializing in ${ENV.NODE_ENV} mode...`);
        // Connect to MongoDB
        try {
            await connectDatabase(ENV.MONGODB_URI);
        }
        catch (dbErr) {
            console.warn('[Islamic Prayer Backend] MongoDB is not running locally. Starting in stateless/cached mode for Quran and calculation services.');
        }
        // Start background notification dispatcher (every 60 seconds)
        schedulerInterval = setInterval(async () => {
            try {
                await NotificationSchedulerService.dispatchDueJobs();
            }
            catch (err) {
                // Ignored if db offline
            }
        }, 60 * 1000);
        const server = app.listen(ENV.PORT, () => {
            console.log(`[Islamic Prayer Backend] Server listening on http://localhost:${ENV.PORT}`);
            console.log(`[Islamic Prayer Backend] Health endpoint: http://localhost:${ENV.PORT}/api/v1/health`);
        });
        // Graceful Shutdown Handlers
        const shutdown = async (signal) => {
            console.log(`\n[Server] ${signal} signal received. Closing HTTP server and database...`);
            if (schedulerInterval) {
                clearInterval(schedulerInterval);
            }
            server.close(async () => {
                await disconnectDatabase();
                console.log('[Server] Graceful shutdown complete.');
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        console.error('[Islamic Prayer Backend] Bootstrap failed:', error);
        process.exit(1);
    }
}
if (process.env.NODE_ENV !== 'test') {
    bootstrap();
}
export default app;
