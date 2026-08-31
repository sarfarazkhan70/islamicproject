import { z } from 'zod';
export const toggleAzkarFavoriteSchema = z.object({
    body: z.object({
        azkarId: z.string().min(1, 'Azkar ID is required'),
    }),
});
