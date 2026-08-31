import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Bookmark } from '../src/models/Bookmark.js';
import { ReadingProgress } from '../src/models/ReadingProgress.js';
import { AzkarFavorite } from '../src/models/AzkarFavorite.js';
import { generateAccessToken } from '../src/utils/jwt.js';

describe('Phase 6 — Quran, Surah Al-Mulk & Azkar Endpoints', () => {
  let userToken: string;
  let userBToken: string;
  let userId: string;
  let userBId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Bookmark.deleteMany({});
    await ReadingProgress.deleteMany({});
    await AzkarFavorite.deleteMany({});

    // User A
    const userA = await User.create({
      email: 'quran_user_a@test.com',
      passwordHash: 'mock_password_hash',
      isActive: true,
    });
    userId = userA._id.toString();
    userToken = generateAccessToken({ userId, email: userA.email });

    // User B
    const userB = await User.create({
      email: 'quran_user_b@test.com',
      passwordHash: 'mock_password_hash',
      isActive: true,
    });
    userBId = userB._id.toString();
    userBToken = generateAccessToken({ userId: userBId, email: userB.email });
  });

  describe('1. Quran Metadata & Verified Content', () => {
    it('should return exactly 114 Surahs with complete metadata', async () => {
      const res = await request(app).get('/api/v1/quran/surahs');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.surahs).toHaveLength(114);

      // Verify first and last surahs
      const fatihah = res.body.data.surahs[0];
      expect(fatihah.number).toBe(1);
      expect(fatihah.name).toBe('Al-Fatihah');
      expect(fatihah.arabicName).toBe('الفاتحة');
      expect(fatihah.versesCount).toBe(7);

      const nas = res.body.data.surahs[113];
      expect(nas.number).toBe(114);
      expect(nas.name).toBe('An-Nas');
      expect(nas.versesCount).toBe(6);
    });

    it('should return 30 Juz index with starting surahs and ayahs', async () => {
      const res = await request(app).get('/api/v1/quran/juz');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.juz).toHaveLength(30);

      const juz1 = res.body.data.juz[0];
      expect(juz1.number).toBe(1);
      expect(juz1.startSurah).toBe(1);

      const juz30 = res.body.data.juz[29];
      expect(juz30.number).toBe(30);
      expect(juz30.startSurah).toBe(78);
    });

    it('should retrieve full verified Surah Al-Mulk (Surah 67) with 30 ayahs and reciter audio', async () => {
      const res = await request(app).get('/api/v1/quran/surah/67');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const mulk = res.body.data.surah;
      expect(mulk.number).toBe(67);
      expect(mulk.name).toBe('Al-Mulk');
      expect(mulk.versesCount).toBe(30);
      expect(mulk.ayahs).toHaveLength(30);

      // Check first ayah Arabic and translation
      expect(mulk.ayahs[0].number).toBe(1);
      expect(mulk.ayahs[0].arabic).toContain('تَبَٰرَكَ ٱلَّذِي بِيَدِهِ ٱلْمُلْكُ');
      expect(mulk.ayahs[0].translation).toContain('Blessed is He in whose hand is dominion');

      // Check reciter audio links
      expect(mulk.audioRecitations.length).toBeGreaterThanOrEqual(2);
      expect(mulk.audioRecitations[0].audioUrl).toContain('067.mp3');
    });

    it('should reject invalid surah numbers', async () => {
      const res = await request(app).get('/api/v1/quran/surah/999');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should search Quran across surah names and verses', async () => {
      const res = await request(app).get('/api/v1/quran/search?q=mulk');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.surahs.length).toBeGreaterThan(0);
      expect(res.body.data.surahs[0].name).toBe('Al-Mulk');
    });
  });

  describe('2. Quran Bookmarks & Reading Progress Persistence', () => {
    it('should enforce authentication on bookmark operations', async () => {
      const res1 = await request(app).get('/api/v1/quran/bookmarks');
      expect(res1.status).toBe(401);

      const res2 = await request(app).post('/api/v1/quran/bookmarks').send({
        surahNumber: 67,
        ayahNumber: 1,
        surahName: 'Al-Mulk',
      });
      expect(res2.status).toBe(401);
    });

    it('should add, retrieve, and remove bookmarks idempotently', async () => {
      // 1. Add Bookmark
      const addRes = await request(app)
        .post('/api/v1/quran/bookmarks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          surahNumber: 67,
          ayahNumber: 14,
          surahName: 'Al-Mulk',
          ayahText: 'Does He who created not know...',
        });

      expect(addRes.status).toBe(201);
      expect(addRes.body.data.bookmark.surahNumber).toBe(67);
      expect(addRes.body.data.bookmark.ayahNumber).toBe(14);

      // 2. Fetch bookmarks
      const getRes = await request(app)
        .get('/api/v1/quran/bookmarks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.bookmarks).toHaveLength(1);

      // 3. Remove Bookmark
      const delRes = await request(app)
        .delete('/api/v1/quran/bookmarks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          surahNumber: 67,
          ayahNumber: 14,
        });

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.removed).toBe(true);

      const getAfterDel = await request(app)
        .get('/api/v1/quran/bookmarks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(getAfterDel.body.data.bookmarks).toHaveLength(0);
    });

    it('should track reading progress per user', async () => {
      // Update progress
      const postRes = await request(app)
        .post('/api/v1/quran/progress')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          surahNumber: 18,
          ayahNumber: 10,
          surahName: 'Al-Kahf',
          pageNumber: 294,
        });

      expect(postRes.status).toBe(200);
      expect(postRes.body.data.progress.surahNumber).toBe(18);

      // Fetch progress
      const getRes = await request(app)
        .get('/api/v1/quran/progress')
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.progress.surahName).toBe('Al-Kahf');
      expect(getRes.body.data.progress.ayahNumber).toBe(10);
    });

    it('should isolate bookmarks between User A and User B', async () => {
      // User A creates bookmark
      await request(app)
        .post('/api/v1/quran/bookmarks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          surahNumber: 67,
          ayahNumber: 1,
          surahName: 'Al-Mulk',
        });

      // User B fetches bookmarks
      const resB = await request(app)
        .get('/api/v1/quran/bookmarks')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(resB.status).toBe(200);
      expect(resB.body.data.bookmarks).toHaveLength(0); // User B has 0 bookmarks
    });
  });

  describe('3. Azkar & Authentic Duas', () => {
    it('should return all 6 authentic Azkar categories', async () => {
      const res = await request(app).get('/api/v1/azkar/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categories).toHaveLength(6);

      const ids = res.body.data.categories.map((c: any) => c.id);
      expect(ids).toContain('morning');
      expect(ids).toContain('evening');
      expect(ids).toContain('after-salah');
      expect(ids).toContain('sleep');
      expect(ids).toContain('protection');
      expect(ids).toContain('general');
    });

    it('should return authentic supplications with Hadith references and Arabic text', async () => {
      const res = await request(app).get('/api/v1/azkar/items');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);

      // Verify every item has Arabic, transliteration, translation, reference, and repetitionTarget
      for (const item of res.body.data.items) {
        expect(item.arabic).toBeDefined();
        expect(item.translation).toBeDefined();
        expect(item.reference).toBeDefined();
        expect(item.repetitionTarget).toBeGreaterThanOrEqual(1);
      }
    });

    it('should filter Azkar by category', async () => {
      const res = await request(app).get('/api/v1/azkar/items?category=morning');

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      for (const item of res.body.data.items) {
        expect(item.category).toBe('morning');
      }
    });

    it('should toggle Azkar favorites for authenticated user', async () => {
      // 1. Favorite an item
      const favRes = await request(app)
        .post('/api/v1/azkar/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ azkarId: 'azkar-m-1' });

      expect(favRes.status).toBe(200);
      expect(favRes.body.data.isFavorited).toBe(true);

      // 2. Fetch favorites
      const listRes = await request(app)
        .get('/api/v1/azkar/favorites')
        .set('Authorization', `Bearer ${userToken}`);

      expect(listRes.body.data.favorites).toContain('azkar-m-1');

      // 3. Toggle off
      const unfavRes = await request(app)
        .post('/api/v1/azkar/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ azkarId: 'azkar-m-1' });

      expect(unfavRes.body.data.isFavorited).toBe(false);
    });
  });
});
