import { z } from 'zod';
export const subscribePushSchema = z.object({
    body: z.object({
        endpoint: z.string().url('A valid push service URL is required'),
        keys: z.object({
            p256dh: z.string().min(1, 'p256dh key is required'),
            auth: z.string().min(1, 'auth secret is required'),
        }),
        device: z
            .object({
            userAgent: z.string().optional(),
            platform: z.string().optional(),
        })
            .optional(),
    }),
});
export const unsubscribePushSchema = z.object({
    body: z.object({
        endpoint: z.string().min(1, 'Push endpoint is required'),
    }),
});
export const updateNotificationPreferencesSchema = z.object({
    body: z.object({
        enabled: z.boolean().optional(),
        prayerReminders: z
            .object({
            enabled: z.boolean().optional(),
            fajr: z.boolean().optional(),
            zuhr: z.boolean().optional(),
            asr: z.boolean().optional(),
            maghrib: z.boolean().optional(),
            isha: z.boolean().optional(),
            leadTimeMinutes: z.union([z.literal(0), z.literal(5), z.literal(10), z.literal(15)]).optional(),
        })
            .optional(),
        surahMulk11pm: z
            .object({
            enabled: z.boolean().optional(),
            time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:mm 24-hour format').optional(),
        })
            .optional(),
        fridayKahf: z
            .object({
            enabled: z.boolean().optional(),
            leadTimeMinutes: z.number().min(0).max(180).optional(),
        })
            .optional(),
        jumuahTime: z
            .string()
            .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Jumuah time must be in HH:mm 24-hour format')
            .optional(),
        soundEnabled: z.boolean().optional(),
    }),
});
