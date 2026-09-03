/**
 * Official Quran.com API v4 Client Service
 * Powered by Quran Foundation Content APIs
 * Documentation: https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/quran-verses-by-script/
 */

const BASE_URL = 'https://api.quran.com/api/v4';

export type QuranScriptType =
  | 'indopak'
  | 'uthmani'
  | 'uthmani_tajweed'
  | 'uthmani_simple'
  | 'imlaei'
  | 'imlaei_simple';

export interface QuranTranslationResource {
  id: number;
  name: string;
  authorName: string;
  languageName: string;
}

export interface QuranReciterResource {
  id: number;
  name: string;
  style?: string | null;
  audioServerUrl?: string;
}

export interface QuranChapter {
  id: number;
  revelation_place: 'makkah' | 'madinah' | string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: [number, number];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface QuranChapterInfo {
  id: number;
  chapter_id: number;
  language_name: string;
  short_text: string;
  source: string;
  text: string;
}

export interface QuranVerseTranslation {
  id: number;
  resource_id: number;
  text: string;
  author_name?: string;
}

export interface QuranVerseApi {
  id: number;
  verse_number: number;
  verse_key: string;
  chapter_id?: number;
  hizb_number?: number;
  rub_el_hizb_number?: number;
  ruku_number?: number;
  manzil_number?: number;
  sajdah_number?: number | null;
  sajdah_type?: string | null;
  page_number?: number;
  juz_number?: number;
  text_uthmani?: string;
  text_indopak?: string;
  text_uthmani_tajweed?: string;
  text_uthmani_simple?: string;
  text_imlaei?: string;
  translations?: QuranVerseTranslation[];
  audio?: {
    url: string;
  };
}

export interface VersesResponse {
  verses: QuranVerseApi[];
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

// In-memory cache to avoid duplicate API requests
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

function getCached<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }
  try {
    const local = localStorage.getItem(`quran_cache_${key}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS * 24) {
        memoryCache.set(key, parsed);
        return parsed.data as T;
      }
    }
  } catch {
    // localStorage not accessible or full
  }
  return null;
}

function setCached(key: string, data: any): void {
  const entry = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);
  try {
    localStorage.setItem(`quran_cache_${key}`, JSON.stringify(entry));
  } catch {
    // ignore quota errors
  }
}

export const QuranApiService = {
  /**
   * Fetch all 114 Surahs / Chapters list from Quran.com API v4
   */
  async getChapters(): Promise<QuranChapter[]> {
    const cacheKey = 'all_chapters';
    const cached = getCached<QuranChapter[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${BASE_URL}/chapters?language=en`);
      if (!res.ok) throw new Error(`Failed to fetch chapters: ${res.statusText}`);
      const data = await res.json();
      setCached(cacheKey, data.chapters);
      return data.chapters;
    } catch (err) {
      console.error('Error fetching Quran chapters from API:', err);
      throw err;
    }
  },

  /**
   * Fetch Surah historical context, revelation period, and background info
   */
  async getChapterInfo(chapterId: number): Promise<QuranChapterInfo | null> {
    const cacheKey = `chapter_info_${chapterId}`;
    const cached = getCached<QuranChapterInfo>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${BASE_URL}/chapters/${chapterId}/info?language=en`);
      if (!res.ok) return null;
      const data = await res.json();
      setCached(cacheKey, data.chapter_info);
      return data.chapter_info;
    } catch (err) {
      console.warn(`Could not load chapter info for Surah ${chapterId}:`, err);
      return null;
    }
  },

  /**
   * Fetch verses of a chapter with multiple script options and selected translations
   */
  async getVersesByChapter(
    chapterId: number,
    translationIds: number[] = [20, 234, 831]
  ): Promise<QuranVerseApi[]> {
    const translationsQuery = translationIds.length > 0 ? translationIds.join(',') : '20,234,831';
    const cacheKey = `verses_surah_${chapterId}_tr_${translationsQuery}`;
    const cached = getCached<QuranVerseApi[]>(cacheKey);
    if (cached && cached.length > 0) return cached;

    try {
      // 1. Fetch main verses with metadata & translations & standard fields
      const fields = [
        'text_uthmani',
        'text_indopak',
        'text_imlaei',
        'text_uthmani_simple',
        'chapter_id',
        'verse_number',
        'verse_key',
        'page_number',
        'juz_number',
        'hizb_number',
        'rub_el_hizb_number',
        'ruku_number',
        'manzil_number',
        'sajdah_number',
      ].join(',');

      const url = `${BASE_URL}/verses/by_chapter/${chapterId}?per_page=300&fields=${fields}&translations=${translationsQuery}&language=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status} when fetching verses for Surah ${chapterId}`);
      const data = await res.json();
      let verses: QuranVerseApi[] = data.verses || [];

      // 2. Fetch Tajweed script asynchronously to enrich the verses
      try {
        const tajweedRes = await fetch(`${BASE_URL}/quran/verses/uthmani_tajweed?chapter_number=${chapterId}`);
        if (tajweedRes.ok) {
          const tajweedData = await tajweedRes.json();
          const tajweedMap = new Map<string, string>();
          (tajweedData.verses || []).forEach((v: any) => {
            tajweedMap.set(v.verse_key, v.text_uthmani_tajweed);
          });

          verses = verses.map((v) => ({
            ...v,
            text_uthmani_tajweed: tajweedMap.get(v.verse_key) || v.text_uthmani,
          }));
        }
      } catch (tajweedErr) {
        console.warn('Tajweed fetch fallback:', tajweedErr);
      }

      setCached(cacheKey, verses);
      return verses;
    } catch (err) {
      console.error(`Error loading verses for chapter ${chapterId}:`, err);
      throw err;
    }
  },

  /**
   * Fetch verses by Mushaf Page (1-604)
   */
  async getVersesByPage(
    pageNumber: number,
    translationIds: number[] = [20, 234]
  ): Promise<QuranVerseApi[]> {
    const translationsQuery = translationIds.length > 0 ? translationIds.join(',') : '20,234';
    const cacheKey = `verses_page_${pageNumber}_tr_${translationsQuery}`;
    const cached = getCached<QuranVerseApi[]>(cacheKey);
    if (cached) return cached;

    try {
      const fields = 'text_uthmani,text_indopak,text_imlaei,text_uthmani_simple,chapter_id,verse_number,verse_key,page_number,juz_number';
      const url = `${BASE_URL}/verses/by_page/${pageNumber}?per_page=50&fields=${fields}&translations=${translationsQuery}&language=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch page ${pageNumber}: ${res.statusText}`);
      const data = await res.json();
      const verses: QuranVerseApi[] = data.verses || [];
      setCached(cacheKey, verses);
      return verses;
    } catch (err) {
      console.error(`Error fetching page ${pageNumber}:`, err);
      throw err;
    }
  },

  /**
   * Fetch verses by Juz (1-30)
   */
  async getVersesByJuz(
    juzNumber: number,
    page: number = 1,
    translationIds: number[] = [20, 234]
  ): Promise<VersesResponse> {
    const translationsQuery = translationIds.length > 0 ? translationIds.join(',') : '20,234';
    const cacheKey = `verses_juz_${juzNumber}_page_${page}_tr_${translationsQuery}`;
    const cached = getCached<VersesResponse>(cacheKey);
    if (cached) return cached;

    try {
      const fields = 'text_uthmani,text_indopak,text_imlaei,text_uthmani_simple,chapter_id,verse_number,verse_key,page_number,juz_number';
      const url = `${BASE_URL}/verses/by_juz/${juzNumber}?page=${page}&per_page=30&fields=${fields}&translations=${translationsQuery}&language=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch Juz ${juzNumber}: ${res.statusText}`);
      const data = await res.json();
      setCached(cacheKey, data);
      return data;
    } catch (err) {
      console.error(`Error fetching Juz ${juzNumber}:`, err);
      throw err;
    }
  },

  /**
   * Fetch chapter recitation audio file URL from Quran.com
   */
  async getChapterRecitationAudio(reciterId: number, chapterNumber: number): Promise<string> {
    const cacheKey = `recitation_audio_${reciterId}_${chapterNumber}`;
    const cached = getCached<string>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${BASE_URL}/chapter_recitations/${reciterId}/${chapterNumber}`);
      if (!res.ok) throw new Error(`Failed to get chapter audio: ${res.statusText}`);
      const data = await res.json();
      const audioUrl = data.audio_file?.audio_url;
      if (audioUrl) {
        setCached(cacheKey, audioUrl);
        return audioUrl;
      }
      throw new Error('Audio URL not found in response');
    } catch (err) {
      console.warn(`Quran.com audio fetch fallback for reciter ${reciterId}:`, err);
      // High-quality fallback servers
      const padded = String(chapterNumber).padStart(3, '0');
      return `https://server8.mp3quran.net/afs/${padded}.mp3`;
    }
  },

  /**
   * Get Ayah audio URL for individual verse playback
   * Format: https://verses.quran.com/Alafasy/mp3/001001.mp3
   */
  getAyahAudioUrl(verseKey: string, reciterSlug: string = 'Alafasy'): string {
    const [chapterStr, verseStr] = verseKey.split(':');
    const chapterNum = parseInt(chapterStr, 10);
    const verseNum = parseInt(verseStr, 10);
    const paddedChapter = String(chapterNum).padStart(3, '0');
    const paddedVerse = String(verseNum).padStart(3, '0');
    return `https://verses.quran.com/${reciterSlug}/mp3/${paddedChapter}${paddedVerse}.mp3`;
  },
};
