import { describe, it, expect, beforeEach, vi } from 'vitest';

// Provide global in-memory localStorage for Node testing environment
const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => storageMap.set(key, String(value)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
  get length() {
    return storageMap.size;
  },
  key: (index: number) => Array.from(storageMap.keys())[index] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

import {
  ReadingProgressService,
  getReadingProgressKey,
  loadAllReadingProgress,
  resetReadingProgressCache,
} from '../services/readingProgressService';
import { useQuranStore } from '../stores/useQuranStore';
import { useLibraryStore } from '../stores/useLibraryStore';

describe('Global Reusable Continue Reading System', () => {
  beforeEach(() => {
    localStorageMock.clear();
    resetReadingProgressCache();
    vi.restoreAllMocks();
  });

  describe('Key Generation & Isolation', () => {
    it('generates consistent and isolated keys for different books and volumes', () => {
      const bukhari1 = getReadingProgressKey('sahih-al-bukhari', 1);
      const bukhari2 = getReadingProgressKey('sahih-al-bukhari', 2);
      const fatawa11 = getReadingProgressKey('fatawa-razawiyya', '1.1');
      const fatawa12 = getReadingProgressKey('fatawa-razawiyya', '1.2');
      const muslim3 = getReadingProgressKey('sahih-muslim', 3);
      const tirmizi2 = getReadingProgressKey('jami-at-tirmidhi', 2);
      const hadaiqUrdu = getReadingProgressKey('hadaiq-e-bakhshish', 'urdu');
      const hadaiqHindi = getReadingProgressKey('hadaiq-e-bakhshish', 'hindi');
      const hadaiqEng = getReadingProgressKey('hadaiq-e-bakhshish', 'english');

      expect(bukhari1).toBe('sahih-al-bukhari:1');
      expect(bukhari2).toBe('sahih-al-bukhari:2');
      expect(fatawa11).toBe('fatawa-razawiyya:1.1');
      expect(fatawa12).toBe('fatawa-razawiyya:1.2');
      expect(muslim3).toBe('sahih-muslim:3');
      expect(tirmizi2).toBe('jami-at-tirmidhi:2');
      expect(hadaiqUrdu).toBe('hadaiq-e-bakhshish:urdu');
      expect(hadaiqHindi).toBe('hadaiq-e-bakhshish:hindi');
      expect(hadaiqEng).toBe('hadaiq-e-bakhshish:english');

      // Verify all keys are strictly distinct
      const keys = [
        bukhari1,
        bukhari2,
        fatawa11,
        fatawa12,
        muslim3,
        tirmizi2,
        hadaiqUrdu,
        hadaiqHindi,
        hadaiqEng,
      ];
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('Independent Progress Persistence without Cross-Overwriting', () => {
    it('saves progress separately for Bukhari Jild 1, Bukhari Jild 2, Muslim, Fatawa, and Tirmizi', () => {
      // 1. Bukhari Jild 1 at Page 100
      ReadingProgressService.saveProgressImmediate('sahih-al-bukhari', 1, 100, 699);

      // 2. Bukhari Jild 2 at Page 400
      ReadingProgressService.saveProgressImmediate('sahih-al-bukhari', 2, 400, 715);

      // 3. Fatawa-e-Razviya Jild 1.1 at Page 80
      ReadingProgressService.saveProgressImmediate('fatawa-razawiyya', '1.1', 80, 520);

      // 4. Sahih Muslim Jild 3 at Page 250
      ReadingProgressService.saveProgressImmediate('sahih-muslim', 3, 250, 480);

      // 5. Jami' at-Tirmidhi Jild 2 at Page 190
      ReadingProgressService.saveProgressImmediate('jami-at-tirmidhi', 2, 190, 550);

      // Verify each progress item is retrieved accurately
      expect(ReadingProgressService.getProgress('sahih-al-bukhari', 1)?.pageNumber).toBe(100);
      expect(ReadingProgressService.getProgress('sahih-al-bukhari', 2)?.pageNumber).toBe(400);
      expect(ReadingProgressService.getProgress('fatawa-razawiyya', '1.1')?.pageNumber).toBe(80);
      expect(ReadingProgressService.getProgress('sahih-muslim', 3)?.pageNumber).toBe(250);
      expect(ReadingProgressService.getProgress('jami-at-tirmidhi', 2)?.pageNumber).toBe(190);
    });

    it('persists data in localStorage and restores upon reload', () => {
      ReadingProgressService.saveProgressImmediate('sahih-al-bukhari', 1, 350, 699);
      ReadingProgressService.saveProgressImmediate('hadaiq-e-bakhshish', 'urdu', 215, 446);

      // Simulate full app reload by reading from storage
      const stored = loadAllReadingProgress();
      expect(stored['sahih-al-bukhari:1'].pageNumber).toBe(350);
      expect(stored['hadaiq-e-bakhshish:urdu'].pageNumber).toBe(215);
    });
  });

  describe('Initial Page Restoration (First Visit vs Saved Visit)', () => {
    it('returns default page 1 on first visit when no progress is saved', () => {
      const page = ReadingProgressService.getInitialPage('sahih-al-bukhari', 1, null, 1);
      expect(page).toBe(1);
    });

    it('returns saved page when reopening a previously read book/volume', () => {
      ReadingProgressService.saveProgressImmediate('sahih-al-bukhari', 1, 100, 699);
      const page = ReadingProgressService.getInitialPage('sahih-al-bukhari', 1, null, 1);
      expect(page).toBe(100);
    });

    it('respects URL query param when explicit page is requested', () => {
      ReadingProgressService.saveProgressImmediate('sahih-al-bukhari', 1, 100, 699);
      // User clicked direct link with ?page=250
      const page = ReadingProgressService.getInitialPage('sahih-al-bukhari', 1, '250', 1);
      expect(page).toBe(250);
    });
  });

  describe('Future-Proof Dynamic Book Progress', () => {
    it('automatically works for any new/future book or multi-volume collection without code changes', () => {
      // Future Book 1: Sirat-un-Nabi 7 Volumes
      ReadingProgressService.saveProgressImmediate('sirat-un-nabi-future-book', 4, 182, 600);

      // Future Book 2: Bahar-e-Shariat 20 Volumes
      ReadingProgressService.saveProgressImmediate('bahar-e-shariat-future-book', 16, 95, 450);

      // Future Single Book
      ReadingProgressService.saveProgressImmediate('future-single-volume-book', 'main', 42, 200);

      expect(ReadingProgressService.getInitialPage('sirat-un-nabi-future-book', 4, null, 1)).toBe(182);
      expect(ReadingProgressService.getInitialPage('bahar-e-shariat-future-book', 16, null, 1)).toBe(95);
      expect(ReadingProgressService.getInitialPage('future-single-volume-book', 'main', null, 1)).toBe(42);
    });
  });

  describe('Holy Quran Continue Reading System', () => {
    it('saves and restores exact Mushaf page, Surah, and Para in Quran store', () => {
      const quranStore = useQuranStore.getState();

      // Navigate to Surah Al-Kahf (Page 294, Surah 18, Para 15)
      quranStore.goToQuranPage(294, 18, 15);

      // Verify progress is saved
      const saved = ReadingProgressService.getQuranProgress();
      expect(saved).not.toBeNull();
      expect(saved?.pageNumber).toBe(294);
      expect(saved?.surahNumber).toBe(18);
      expect(saved?.juzNumber).toBe(15);

      // Verify Quran initial state helper returns the saved position
      const initialQuranPos = ReadingProgressService.getQuranInitialPosition();
      expect(initialQuranPos.page).toBe(294);
      expect(initialQuranPos.surah).toBe(18);
      expect(initialQuranPos.juz).toBe(15);
    });

    it('does not reset Quran to Page 1 when saved position is available', () => {
      // Save position for Para 5, Surah Al-Maidah, Page 102
      ReadingProgressService.saveQuranProgress(102, 5, 6);

      const initialPos = ReadingProgressService.getQuranInitialPosition();
      expect(initialPos.page).toBe(102);
      expect(initialPos.surah).toBe(5);
      expect(initialPos.juz).toBe(6);
    });
  });

  describe('Global Library Store Integration', () => {
    it('updates volumeReadingProgress state when saveVolumeProgress is invoked', () => {
      const store = useLibraryStore.getState();
      store.saveVolumeProgress('sahih-muslim', 2, 175, 500);

      const retrieved = store.getVolumeProgress('sahih-muslim', 2);
      expect(retrieved).toBeDefined();
      expect(retrieved?.pageNumber).toBe(175);
      expect(retrieved?.bookId).toBe('sahih-muslim');
      expect(retrieved?.volumeKey).toBe('2');
    });
  });
});
