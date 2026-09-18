/**
 * ============================================================================
 * GLOBAL ISLAMIC DIGITAL LIBRARY READING PROGRESS SERVICE
 * ============================================================================
 * Unified, persistent, future-proof reading progress manager for all current
 * and future Islamic books, multi-volume compendiums (Jilds), and chapters.
 * ============================================================================
 */

export interface BookReadingProgress {
  bookId: string;
  volumeKey: string; // e.g. "1", "2", "1.1", "urdu", "default"
  pageNumber: number; // Exact displayed / printed page number
  totalPages?: number;
  chapterId?: string;
  sectionId?: string;
  updatedAt: number; // Timestamp
}

const STORAGE_PROGRESS_KEY_V2 = 'islamic_library_progress_v2';
const STORAGE_PROGRESS_KEY_V1 = 'islamic_prayer_library_progress_v1';

let inMemoryCache: Record<string, BookReadingProgress> | null = null;
const debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

/**
 * Generate a unique, deterministic progress key for any Book + Volume combination
 */
export function getReadingProgressKey(bookId: string, volumeKey?: string | number): string {
  const normBookId = (bookId || '').trim().toLowerCase();
  const normVolKey = volumeKey !== undefined && volumeKey !== null ? String(volumeKey).trim() : '1';
  return `${normBookId}:${normVolKey}`;
}

/**
 * Load all stored reading progress from localStorage with migration from v1
 */
export function loadAllReadingProgress(): Record<string, BookReadingProgress> {
  if (inMemoryCache) {
    return inMemoryCache;
  }

  if (typeof localStorage === 'undefined') {
    return {};
  }

  try {
    const rawV2 = localStorage.getItem(STORAGE_PROGRESS_KEY_V2);
    if (rawV2) {
      inMemoryCache = JSON.parse(rawV2);
      return inMemoryCache!;
    }

    // Migrate from v1 legacy structure if v2 is not yet present
    const rawV1 = localStorage.getItem(STORAGE_PROGRESS_KEY_V1);
    if (rawV1) {
      const v1Data = JSON.parse(rawV1) as Record<string, { volumeNumber?: number; chapterId?: string; lastReadAt?: number }>;
      const migrated: Record<string, BookReadingProgress> = {};
      for (const [bookId, item] of Object.entries(v1Data)) {
        const volKey = String(item.volumeNumber || 1);
        const key = getReadingProgressKey(bookId, volKey);
        migrated[key] = {
          bookId,
          volumeKey: volKey,
          pageNumber: 1,
          chapterId: item.chapterId,
          updatedAt: item.lastReadAt || Date.now(),
        };
      }
      inMemoryCache = migrated;
      try {
        localStorage.setItem(STORAGE_PROGRESS_KEY_V2, JSON.stringify(migrated));
      } catch {}
      return inMemoryCache!;
    }
  } catch (err) {
    console.warn('Failed to parse stored library reading progress:', err);
  }

  inMemoryCache = {};
  return inMemoryCache;
}

/**
 * Reset in-memory cache (for testing and isolation)
 */
export function resetReadingProgressCache(): void {
  inMemoryCache = null;
  debounceTimers.forEach((timer) => clearTimeout(timer));
  debounceTimers.clear();
}

/**
 * Save progress immediately to memory and persist to localStorage
 */
function persistToLocalStorage(data: Record<string, BookReadingProgress>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PROGRESS_KEY_V2, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save library reading progress to localStorage:', err);
  }
}

export class ReadingProgressService {
  /**
   * Retrieve saved reading progress for a specific Book + Volume
   */
  public static getProgress(bookId: string, volumeKey?: string | number): BookReadingProgress | undefined {
    const all = loadAllReadingProgress();
    const key = getReadingProgressKey(bookId, volumeKey);
    return all[key];
  }

  /**
   * Save reading progress for a specific Book + Volume with debounce (default 300ms)
   */
  public static saveProgress(
    bookId: string,
    volumeKey: string | number,
    pageNumber: number,
    totalPages?: number,
    extra?: { chapterId?: string; sectionId?: string; immediate?: boolean }
  ): void {
    if (!bookId || !pageNumber || pageNumber < 1) return;

    const key = getReadingProgressKey(bookId, volumeKey);
    const validPage = totalPages ? Math.min(totalPages, Math.max(1, Math.round(pageNumber))) : Math.max(1, Math.round(pageNumber));

    const item: BookReadingProgress = {
      bookId,
      volumeKey: String(volumeKey ?? '1'),
      pageNumber: validPage,
      totalPages,
      chapterId: extra?.chapterId,
      sectionId: extra?.sectionId,
      updatedAt: Date.now(),
    };

    const performSave = () => {
      const all = loadAllReadingProgress();
      all[key] = item;
      inMemoryCache = { ...all };
      persistToLocalStorage(inMemoryCache);
    };

    if (extra?.immediate) {
      // Clear any pending debounce timer and save right away
      if (debounceTimers.has(key)) {
        clearTimeout(debounceTimers.get(key)!);
        debounceTimers.delete(key);
      }
      performSave();
      return;
    }

    if (debounceTimers.has(key)) {
      clearTimeout(debounceTimers.get(key)!);
    }

    const timer = setTimeout(() => {
      debounceTimers.delete(key);
      performSave();
    }, 300);

    debounceTimers.set(key, timer);
  }

  /**
   * Save progress immediately without debouncing
   */
  public static saveProgressImmediate(
    bookId: string,
    volumeKey: string | number,
    pageNumber: number,
    totalPages?: number,
    extra?: { chapterId?: string; sectionId?: string }
  ): void {
    this.saveProgress(bookId, volumeKey, pageNumber, totalPages, { ...extra, immediate: true });
  }

  /**
   * Resolve starting page on reader mount:
   * 1. URL search param `?page=...` (explicit deep link from user)
   * 2. Saved reading progress for this specific Book + Volume
   * 3. Fallback default (page 1)
   */
  public static getInitialPage(
    bookId: string,
    volumeKey: string | number,
    urlPageParam?: string | null,
    defaultPage: number = 1
  ): number {
    if (urlPageParam) {
      const parsed = parseInt(urlPageParam, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        return parsed;
      }
    }

    const saved = this.getProgress(bookId, volumeKey);
    if (saved && saved.pageNumber >= 1) {
      return saved.pageNumber;
    }

    return defaultPage;
  }

  /**
   * Save Holy Quran Reading Progress
   */
  public static saveQuranProgress(pageNumber: number, surahNumber?: number, juzNumber?: number): void {
    const quranData = {
      pageNumber,
      surahNumber: surahNumber || 1,
      juzNumber: juzNumber || 1,
      updatedAt: new Date().toISOString(),
    };
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('islamic_quran_progress_v4', JSON.stringify(quranData));
      } catch {}
    }
    this.saveProgressImmediate('holy-quran', 'mushaf', pageNumber, 604, {
      chapterId: String(surahNumber || 1),
    });
  }

  /**
   * Get Holy Quran Reading Progress
   */
  public static getQuranProgress(): { pageNumber: number; surahNumber: number; juzNumber: number } | null {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('islamic_quran_progress_v4');
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            pageNumber: parsed.pageNumber || 1,
            surahNumber: parsed.surahNumber || 1,
            juzNumber: parsed.juzNumber || 1,
          };
        }
      } catch {}
    }
    const prog = this.getProgress('holy-quran', 'mushaf');
    if (prog) {
      return {
        pageNumber: prog.pageNumber,
        surahNumber: prog.chapterId ? parseInt(prog.chapterId, 10) : 1,
        juzNumber: 1,
      };
    }
    return null;
  }

  /**
   * Resolve Quran Initial Position on mount / app load
   */
  public static getQuranInitialPosition(): { page: number; surah: number; juz: number } {
    const prog = this.getQuranProgress();
    if (prog && prog.pageNumber >= 1 && prog.pageNumber <= 604) {
      return {
        page: prog.pageNumber,
        surah: prog.surahNumber,
        juz: prog.juzNumber,
      };
    }
    return { page: 1, surah: 1, juz: 1 };
  }

  /**
   * Clear saved progress for a book or specific volume
   */
  public static clearProgress(bookId: string, volumeKey?: string | number): void {
    const all = loadAllReadingProgress();
    if (volumeKey !== undefined && volumeKey !== null) {
      const key = getReadingProgressKey(bookId, volumeKey);
      delete all[key];
    } else {
      const prefix = `${bookId.trim().toLowerCase()}:`;
      for (const k of Object.keys(all)) {
        if (k.startsWith(prefix)) {
          delete all[k];
        }
      }
    }
    inMemoryCache = { ...all };
    persistToLocalStorage(inMemoryCache);
  }
}
