import { z } from 'zod';
export const updateQazaCountsSchema = z.object({
    body: z.object({
        fajr: z.number().int().min(0).optional(),
        zuhr: z.number().int().min(0).optional(),
        asr: z.number().int().min(0).optional(),
        maghrib: z.number().int().min(0).optional(),
        isha: z.number().int().min(0).optional(),
        witr: z.number().int().min(0).optional(),
        dailyTarget: z.number().int().min(1).optional(),
        lifetimeEstimate: z
            .object({
            totalMonthsMissed: z.number().min(0),
            startingAge: z.number().min(7),
            gender: z.string(),
        })
            .optional(),
    }),
});
export const incrementQazaSchema = z.object({
    body: z.object({
        prayer: z.enum(['fajr', 'zuhr', 'asr', 'maghrib', 'isha', 'witr'], {
            required_error: 'prayer is required',
        }),
        amount: z.number().int().min(1).default(1),
    }),
});
export const repayQazaSchema = z.object({
    body: z.object({
        prayer: z.enum(['fajr', 'zuhr', 'asr', 'maghrib', 'isha', 'witr'], {
            required_error: 'prayer is required',
        }),
        quantity: z.number().int().min(1).default(1),
        localDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'localDate must be in YYYY-MM-DD format')
            .optional(),
    }),
});
export const updateDailyTargetSchema = z.object({
    body: z.object({
        target: z.number().int().min(1, 'Daily target must be at least 1'),
    }),
});
