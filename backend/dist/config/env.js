import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const envSchema = z.object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: z.string().default('mongodb://localhost:27017/islamic_prayer'),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('development_jwt_access_secret_key_32chars_min'),
    JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters').default('development_jwt_refresh_secret_key_32chars_min'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    FRONTEND_URL: z.string().default('http://localhost:5173'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
    RATE_LIMIT_MAX: z.coerce.number().default(100),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().default(15),
    VAPID_PUBLIC_KEY: z.string().default('BPGNpd3iPMMs-tl95Yf2dMwkav4pTXsyslzgVsRUpVbs0wTNvlZ1JgZRSEN4ZumV_zpJ54ezngmV_MejLb603WY'),
    VAPID_PRIVATE_KEY: z.string().default('uySkCzjJdM4qLuUHm2eCGC5YLAQfuv85t0DU5fnnTLQ'),
    VAPID_SUBJECT: z.string().default('mailto:admin@islamicprayer.app'),
    QURAN_API_CLIENT_ID: z.string().default('d20ae676-73f6-4498-98e0-beb0490fdbc3'),
    QURAN_API_CLIENT_SECRET: z.string().default(''),
    QURAN_API_BASE_URL: z.string().default('https://apis.quran.foundation/content/api/v4'),
    QURAN_API_AUTH_URL: z.string().default('https://oauth2.quran.foundation/oauth2/token'),
    QURAN_API_FALLBACK_URL: z.string().default('https://api.quran.com/api/v4'),
    QURAN_API_ENV: z.enum(['production', 'prelive', 'test']).default('production'),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error('Invalid environment variables:', parsedEnv.error.format());
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Fatal: Invalid environment configuration in production.');
    }
}
export const ENV = parsedEnv.success ? parsedEnv.data : envSchema.parse({});
