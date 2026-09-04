import { Request, Response, NextFunction } from 'express';
import { QuranApiService } from '../services/quranApi.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

function getParamString(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] || '';
  return param || '';
}

function getQueryString(query: unknown, fallback: string): string {
  if (typeof query === 'string' && query.trim().length > 0) return query;
  return fallback;
}

export class QuranApiController {
  /**
   * GET /api/quran-api/surahs
   */
  static async getSurahs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const surahs = await QuranApiService.getSurahs();
      res.status(200).json(sendSuccess({ count: surahs.length, surahs }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/quran-api/surah/:surahNumber
   */
  static async getSurahDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const surahNumber = parseInt(getParamString(req.params.surahNumber), 10);
      if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_SURAH', message: 'Surah number must be between 1 and 114.' },
        });
        return;
      }

      const translations = getQueryString(req.query.translations, '20,234,831');
      const result = await QuranApiService.getSurah(surahNumber, translations);
      res.status(200).json(sendSuccess(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/quran-api/ayah/:surahNumber/:ayahNumber
   */
  static async getAyahDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const surahNumber = parseInt(getParamString(req.params.surahNumber), 10);
      const ayahNumber = parseInt(getParamString(req.params.ayahNumber), 10);

      if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_SURAH', message: 'Surah number must be between 1 and 114.' },
        });
        return;
      }

      if (isNaN(ayahNumber) || ayahNumber < 1) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_AYAH', message: 'Ayah number must be a positive integer.' },
        });
        return;
      }

      const translations = getQueryString(req.query.translations, '20,234,831');
      const ayah = await QuranApiService.getAyah(surahNumber, ayahNumber, translations);
      res.status(200).json(sendSuccess({ ayah }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/quran-api/juz/:juzNumber
   */
  static async getJuzDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const juzNumber = parseInt(getParamString(req.params.juzNumber), 10);
      if (isNaN(juzNumber) || juzNumber < 1 || juzNumber > 30) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_JUZ', message: 'Juz number must be between 1 and 30.' },
        });
        return;
      }

      const pageStr = getQueryString(req.query.page, '1');
      const page = parseInt(pageStr, 10) || 1;
      const translations = getQueryString(req.query.translations, '20,234');
      const result = await QuranApiService.getJuz(juzNumber, page, translations);
      res.status(200).json(sendSuccess(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/quran-api/page/:pageNumber
   */
  static async getPageDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageNumber = parseInt(getParamString(req.params.pageNumber), 10);
      if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > 604) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_PAGE', message: 'Madani Mushaf page number must be between 1 and 604.' },
        });
        return;
      }

      const translations = getQueryString(req.query.translations, '20,234');
      const result = await QuranApiService.getPage(pageNumber, translations);
      res.status(200).json(sendSuccess(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/quran-api/recitations
   */
  static async getRecitations(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recitations = await QuranApiService.getRecitations();
      res.status(200).json(sendSuccess({ count: recitations.length, recitations }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/quran-api/translations
   */
  static async getTranslations(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const translations = await QuranApiService.getTranslations();
      res.status(200).json(sendSuccess({ count: translations.length, translations }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/quran-api/tafsirs
   */
  static async getTafsirs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tafsirs = await QuranApiService.getTafsirs();
      res.status(200).json(sendSuccess({ count: tafsirs.length, tafsirs }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/quran-api/status
   */
  static async getStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await QuranApiService.getApiStatus();
      res.status(200).json(sendSuccess(status));
    } catch (err) {
      next(err);
    }
  }
}
