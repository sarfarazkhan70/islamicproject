import { Router } from 'express';
import { QuranController } from '../controllers/quran.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { addBookmarkSchema, removeBookmarkSchema, updateProgressSchema, } from '../validators/quran.validators.js';
const router = Router();
// Public routes
router.get('/surahs', QuranController.getSurahs);
router.get('/juz', QuranController.getJuzList);
router.get('/surah/:number', QuranController.getSurahDetail);
router.get('/search', QuranController.search);
router.get('/pdf', QuranController.streamQuranPdf);
router.get('/pdf/status', QuranController.getPdfStatus);
// Authenticated bookmark routes
router.get('/bookmarks', requireAuth, QuranController.getBookmarks);
router.post('/bookmarks', requireAuth, validate(addBookmarkSchema), QuranController.addBookmark);
router.delete('/bookmarks', requireAuth, validate(removeBookmarkSchema), QuranController.removeBookmark);
// Authenticated reading progress routes
router.get('/progress', requireAuth, QuranController.getProgress);
router.post('/progress', requireAuth, validate(updateProgressSchema), QuranController.updateProgress);
export const quranRoutes = router;
