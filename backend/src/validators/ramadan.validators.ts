import { z } from 'zod';

export const updateFastingRecordSchema = z.object({
  body: z.object({
    localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    hijriYear: z.number().int().min(1400).max(1600),
    ramadanDay: z.number().int().min(1).max(30),
    status: z.enum(['FASTED', 'MISSED', 'EXCUSED', 'QAZA']),
    notes: z.string().max(500).optional(),
  }),
});

export const updateKhatamProgressSchema = z.object({
  body: z.object({
    hijriYear: z.number().int().min(1400).max(1600),
    completedJuz: z.array(z.number().int().min(1).max(30)),
    notes: z.string().max(1000).optional(),
  }),
});
