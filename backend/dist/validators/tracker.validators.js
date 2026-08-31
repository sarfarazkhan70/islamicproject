import { z } from 'zod';
export const updatePrayerStatusSchema = z.object({
    body: z.object({
        localDate: z
            .string({ required_error: 'localDate is required' })
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'localDate must be in YYYY-MM-DD format'),
        prayer: z.enum(['fajr', 'zuhr', 'asr', 'maghrib', 'isha', 'tahajjud', 'duha', 'witr', 'jumuah'], {
            required_error: 'prayer is required',
        }),
        status: z.enum(['ADA', 'MISSED', 'EXCUSED', 'QAZA', 'NONE'], {
            required_error: 'status is required',
        }),
        scheduledTime: z.string().optional(),
        timezone: z.string().optional(),
        isVoluntary: z.boolean().optional(),
    }),
});
export const bulkSyncTrackerSchema = z.object({
    body: z.object({
        records: z.array(z.object({
            localDate: z
                .string()
                .regex(/^\d{4}-\d{2}-\d{2}$/, 'localDate must be in YYYY-MM-DD format'),
            prayer: z.enum(['fajr', 'zuhr', 'asr', 'maghrib', 'isha', 'tahajjud', 'duha', 'witr', 'jumuah']),
            status: z.enum(['ADA', 'MISSED', 'EXCUSED', 'QAZA', 'NONE']),
            scheduledTime: z.string().optional(),
            timezone: z.string().optional(),
            isVoluntary: z.boolean().optional(),
        })),
    }),
});
export const getTrackerByDateSchema = z.object({
    query: z.object({
        date: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format')
            .optional(),
    }),
});
