import { Router } from 'express';
import { QuranApiController } from '../controllers/quranApi.controller.js';

const router = Router();

// Provider & Authentication Health / Status
router.get('/status', QuranApiController.getStatus);

// Quran Content Endpoints
router.get('/surahs', QuranApiController.getSurahs);
router.get('/surah/:surahNumber', QuranApiController.getSurahDetail);
router.get('/ayah/:surahNumber/:ayahNumber', QuranApiController.getAyahDetail);
router.get('/juz/:juzNumber', QuranApiController.getJuzDetail);
router.get('/page/:pageNumber', QuranApiController.getPageDetail);

// Resource Registries
router.get('/recitations', QuranApiController.getRecitations);
router.get('/translations', QuranApiController.getTranslations);
router.get('/tafsirs', QuranApiController.getTafsirs);

export const quranApiRouter = router;
