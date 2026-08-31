import { z } from 'zod';
export const addBookmarkSchema = z.object({
    body: z.object({
        surahNumber: z.number().int().min(1).max(114),
        ayahNumber: z.number().int().min(1),
        surahName: z.string().min(1),
        ayahText: z.string().optional(),
    }),
});
export const removeBookmarkSchema = z.object({
    body: z.object({
        surahNumber: z.number().int().min(1).max(114),
        ayahNumber: z.number().int().min(1),
    }),
});
export const updateProgressSchema = z.object({
    body: z.object({
        surahNumber: z.number().int().min(1).max(114),
        ayahNumber: z.number().int().min(1),
        surahName: z.string().min(1),
        pageNumber: z.number().int().min(1).max(604).optional(),
    }),
});
