import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { ENV } from '../src/config/env.js';

describe('Quran Foundation / Quran.com API Integration Tests', () => {
  describe('1. API Status & Security Verification', () => {
    it('should return safe provider info without leaking client secrets', async () => {
      const res = await request(app).get('/api/v1/quran-api/status');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.provider).toContain('Quran Foundation');
      expect(res.body.data.authMethod).toContain('OAuth2');
      expect(res.body.data.supportedMushafPages).toBe(604);

      // Security Checks
      const bodyString = JSON.stringify(res.body);
      expect(bodyString).not.toContain(ENV.JWT_SECRET);
      if (ENV.QURAN_API_CLIENT_SECRET) {
        expect(bodyString).not.toContain(ENV.QURAN_API_CLIENT_SECRET);
      }
    });
  });

  describe('2. Surahs Endpoint (/api/v1/quran-api/surahs)', () => {
    it('should return all 114 Surahs with verified Madani Mushaf page ranges', async () => {
      const res = await request(app).get('/api/v1/quran-api/surahs');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.surahs).toHaveLength(114);

      const fatihah = res.body.data.surahs[0];
      expect(fatihah.id).toBe(1);
      expect(fatihah.name_simple).toBe('Al-Fatihah');
      expect(fatihah.name_arabic).toBe('الفاتحة');
      expect(fatihah.verses_count).toBe(7);
      expect(fatihah.pages).toEqual([1, 1]);

      const baqarah = res.body.data.surahs[1];
      expect(baqarah.id).toBe(2);
      expect(baqarah.name_simple).toBe('Al-Baqarah');
      expect(baqarah.verses_count).toBe(286);
      expect(baqarah.pages).toEqual([2, 49]);

      const nas = res.body.data.surahs[113];
      expect(nas.id).toBe(114);
      expect(nas.name_simple).toBe('An-Nas');
      expect(nas.verses_count).toBe(6);
      expect(nas.pages).toEqual([604, 604]);
    });
  });

  describe('3. Surah Detail Endpoint (/api/v1/quran-api/surah/:surahNumber)', () => {
    it('should retrieve Surah Al-Fatihah (Surah 1) with Uthmani, IndoPak, and Urdu/English translations', async () => {
      const res = await request(app).get('/api/v1/quran-api/surah/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.chapter.name_simple).toBe('Al-Fatihah');
      expect(res.body.data.verses).toHaveLength(7);

      const v1 = res.body.data.verses[0];
      expect(v1.verse_key).toBe('1:1');
      expect(v1.page_number).toBe(1);
      expect(v1.juz_number).toBe(1);
      expect(v1.text_uthmani).toBeDefined();
      expect(v1.text_indopak).toBeDefined();
      expect(v1.translations).toBeDefined();
      expect(v1.translations?.length).toBeGreaterThanOrEqual(2);
    });

    it('should retrieve Surah Al-Baqarah (Surah 2) with 286 verses', async () => {
      const res = await request(app).get('/api/v1/quran-api/surah/2');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.chapter.name_simple).toBe('Al-Baqarah');
      expect(res.body.data.verses).toHaveLength(286);
    });

    it('should reject invalid surah numbers with 400 Bad Request', async () => {
      const res = await request(app).get('/api/v1/quran-api/surah/115');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Ayah Detail Endpoint (/api/v1/quran-api/ayah/:surahNumber/:ayahNumber)', () => {
    it('should retrieve Ayat al-Kursi (Surah 2 Ayah 255) with exact page 42 and Juz 3 mapping', async () => {
      const res = await request(app).get('/api/v1/quran-api/ayah/2/255');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const ayah = res.body.data.ayah;
      expect(ayah.verse_key).toBe('2:255');
      expect(ayah.page_number).toBe(42);
      expect(ayah.juz_number).toBe(3);
      expect(ayah.text_uthmani).toContain('ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ');
      expect(ayah.text_indopak).toBeDefined();
      expect(ayah.translations?.length).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve Surah Al-Ikhlas Ayah 1 (112:1) on page 604 in Juz 30', async () => {
      const res = await request(app).get('/api/v1/quran-api/ayah/112/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const ayah = res.body.data.ayah;
      expect(ayah.verse_key).toBe('112:1');
      expect(ayah.page_number).toBe(604);
      expect(ayah.juz_number).toBe(30);
      expect(ayah.text_uthmani).toContain('قُلْ هُوَ ٱللَّهُ أَحَدٌ');
    });

    it('should reject non-existent ayahs', async () => {
      const res = await request(app).get('/api/v1/quran-api/ayah/1/8');
      expect(res.status).toBe(500); // Quran API returns 404 which our error handler wraps
    });
  });

  describe('5. Juz Endpoint (/api/v1/quran-api/juz/:juzNumber)', () => {
    it('should retrieve Juz 1 verses and start with 1:1', async () => {
      const res = await request(app).get('/api/v1/quran-api/juz/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.juz_number).toBe(1);
      expect(res.body.data.verses.length).toBeGreaterThan(0);
      expect(res.body.data.verses[0].verse_key).toBe('1:1');
    });

    it('should retrieve Juz 30 verses and start with Surah 78:1 (An-Naba)', async () => {
      const res = await request(app).get('/api/v1/quran-api/juz/30');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.juz_number).toBe(30);
      expect(res.body.data.verses.length).toBeGreaterThan(0);
      expect(res.body.data.verses[0].verse_key).toBe('78:1');
    });
  });

  describe('6. Quran Page Endpoint (/api/v1/quran-api/page/:pageNumber)', () => {
    it('should retrieve verses for Madani Mushaf Page 1 (Surah 1:1 to 1:7)', async () => {
      const res = await request(app).get('/api/v1/quran-api/page/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.page_number).toBe(1);
      expect(res.body.data.verses).toHaveLength(7);
      expect(res.body.data.verses.map((v: any) => v.verse_key)).toEqual([
        '1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7',
      ]);
    });

    it('should retrieve verses for Madani Mushaf Page 604 (Surahs 112, 113, 114)', async () => {
      const res = await request(app).get('/api/v1/quran-api/page/604');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.page_number).toBe(604);
      expect(res.body.data.verses).toHaveLength(15);
      expect(res.body.data.verses[0].verse_key).toBe('112:1');
      expect(res.body.data.verses[14].verse_key).toBe('114:6');
    });

    it('should reject invalid page numbers', async () => {
      const res = await request(app).get('/api/v1/quran-api/page/605');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('7. Resources Endpoints', () => {
    it('should return available recitations and reciters list', async () => {
      const res = await request(app).get('/api/v1/quran-api/recitations');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBeGreaterThan(0);
      expect(res.body.data.recitations.some((r: any) => r.reciter_name?.includes('AbdulSamad') || r.reciter_name?.includes('Alafasy'))).toBe(true);
    });

    it('should return available translations catalog', async () => {
      const res = await request(app).get('/api/v1/quran-api/translations');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBeGreaterThan(0);
    });

    it('should return available Tafsirs catalog', async () => {
      const res = await request(app).get('/api/v1/quran-api/tafsirs');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBeGreaterThan(0);
    });
  });
});
