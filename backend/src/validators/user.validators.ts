import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  body: z.object({
    location: z
      .object({
        city: z.string().optional(),
        country: z.string().optional(),
        coordinates: z.tuple([z.number(), z.number()]).optional(), // [lng, lat]
        timezone: z.string().optional(),
        isAutoDetected: z.boolean().optional(),
      })
      .optional(),
    madhhab: z.enum(['hanafi', 'shafii', 'maliki', 'hanbali']).optional(),
    calculationMethod: z
      .enum([
        'Karachi',
        'MWL',
        'ISNA',
        'Egypt',
        'Makkah',
        'Tehran',
        'Gulf',
        'Moonsighting',
      ])
      .optional(),
    highLatitudeRule: z
      .enum(['MiddleOfTheNight', 'SeventhOfTheNight', 'TwilightAngle', 'None'])
      .optional(),
    timeFormat: z.enum(['12h', '24h']).optional(),
    theme: z.enum(['emerald-dark', 'desert-light', 'oled-black']).optional(),
    adhanSound: z.string().optional(),
    hijriDateAdjustment: z.number().min(-2).max(2).optional(),
  }),
});
