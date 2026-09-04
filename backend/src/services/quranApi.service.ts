import { ENV } from '../config/env.js';

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number; // Unix timestamp in ms
}

export interface QuranApiChapter {
  id: number;
  revelation_place: string;
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

export interface QuranApiVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  chapter_id: number;
  hizb_number?: number;
  rub_el_hizb_number?: number;
  ruku_number?: number;
  manzil_number?: number;
  sajdah_number?: number | null;
  page_number: number;
  juz_number: number;
  text_uthmani?: string;
  text_indopak?: string;
  text_uthmani_simple?: string;
  text_imlaei?: string;
  text_uthmani_tajweed?: string;
  translations?: Array<{
    id: number;
    resource_id: number;
    text: string;
    author_name?: string;
  }>;
  audio?: {
    url: string;
  };
}

export interface QuranApiStatus {
  provider: string;
  clientId: string;
  authMethod: string;
  tokenEndpoint: string;
  contentBaseUrl: string;
  fallbackUrl: string;
  isAuthenticated: boolean;
  activeBaseUrl: string;
  rateLimits: string;
  licensing: string;
  supportedMushafPages: number;
}

export class QuranApiService {
  private static cachedToken: CachedToken | null = null;
  private static readonly PROVIDER_NAME = 'Quran Foundation (Quran.com Content APIs)';

  /**
   * Safe OAuth2 Token Manager for Quran Foundation API
   */
  private static async getAccessToken(): Promise<string | null> {
    const clientId = ENV.QURAN_API_CLIENT_ID;
    const clientSecret = ENV.QURAN_API_CLIENT_SECRET;

    // If client secret is not configured or is placeholder, return null to use public fallback
    if (!clientSecret || clientSecret === 'PASTE_YOUR_NEW_CLIENT_SECRET_HERE' || clientSecret.trim().length === 0) {
      return null;
    }

    // Check cached token validity (with 60-second safety margin)
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - 60000) {
      return this.cachedToken.accessToken;
    }

    try {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const response = await fetch(ENV.QURAN_API_AUTH_URL, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&scope=content',
      });

      if (!response.ok) {
        return null;
      }

      const tokenData = (await response.json()) as OAuthTokenResponse;
      if (tokenData.access_token) {
        this.cachedToken = {
          accessToken: tokenData.access_token,
          expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
        };
        return tokenData.access_token;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Internal authenticated fetch with high-availability fallback
   */
  private static async fetchFromApi<T>(endpoint: string, queryParams: Record<string, string | number> = {}): Promise<T> {
    const token = await this.getAccessToken();
    const paramsRecord: Record<string, string> = {};
    for (const [k, v] of Object.entries(queryParams)) {
      paramsRecord[k] = String(v);
    }
    const query = new URLSearchParams(paramsRecord).toString();
    const fullQuery = query ? `?${query}` : '';

    if (token) {
      // Primary: Authenticated Quran Foundation Content API
      try {
        const url = `${ENV.QURAN_API_BASE_URL}${endpoint}${fullQuery}`;
        const res = await fetch(url, {
          headers: {
            'x-auth-token': token,
            'x-client-id': ENV.QURAN_API_CLIENT_ID,
          },
        });

        if (res.ok) {
          return (await res.json()) as T;
        }
      } catch {
        // Fall through to fallback
      }
    }

    // Secondary: Quran.com v4 Public / High-Availability API
    const fallbackUrl = `${ENV.QURAN_API_FALLBACK_URL}${endpoint}${fullQuery}`;
    const fallbackRes = await fetch(fallbackUrl, {
      headers: {
        'x-client-id': ENV.QURAN_API_CLIENT_ID,
      },
    });

    if (!fallbackRes.ok) {
      throw new Error(`Quran API error ${fallbackRes.status}: ${fallbackRes.statusText} for endpoint ${endpoint}`);
    }

    return (await fallbackRes.json()) as T;
  }

  /**
   * Retrieve all 114 Surahs
   */
  static async getSurahs(): Promise<QuranApiChapter[]> {
    const data = await this.fetchFromApi<{ chapters: QuranApiChapter[] }>('/chapters', { language: 'en' });
    return data.chapters || [];
  }

  /**
   * Retrieve single Surah with all verses, multiple scripts, translations & Tajweed
   */
  static async getSurah(surahNumber: number, translationIds: string = '20,234,831'): Promise<{
    chapter: QuranApiChapter;
    verses: QuranApiVerse[];
  }> {
    if (surahNumber < 1 || surahNumber > 114) {
      throw new Error(`Invalid Surah number ${surahNumber}. Must be between 1 and 114.`);
    }

    const [chapterData, versesData] = await Promise.all([
      this.fetchFromApi<{ chapter: QuranApiChapter }>(`/chapters/${surahNumber}`, { language: 'en' }),
      this.fetchFromApi<{ verses: QuranApiVerse[] }>(`/verses/by_chapter/${surahNumber}`, {
        per_page: 300,
        fields: 'text_uthmani,text_indopak,text_imlaei,text_uthmani_simple,chapter_id,verse_number,verse_key,page_number,juz_number,hizb_number,rub_el_hizb_number,ruku_number,manzil_number,sajdah_number',
        translations: translationIds,
        language: 'en',
      }),
    ]);

    let verses = versesData.verses || [];

    // Tajweed script enrichment
    try {
      const tajweedData = await this.fetchFromApi<{ verses: Array<{ verse_key: string; text_uthmani_tajweed: string }> }>(
        '/quran/verses/uthmani_tajweed',
        { chapter_number: surahNumber }
      );
      if (tajweedData.verses) {
        const tajweedMap = new Map(tajweedData.verses.map((v) => [v.verse_key, v.text_uthmani_tajweed]));
        verses = verses.map((v) => ({
          ...v,
          text_uthmani_tajweed: tajweedMap.get(v.verse_key) || v.text_uthmani,
        }));
      }
    } catch {
      // Tajweed is optional enrichment
    }

    return {
      chapter: chapterData.chapter,
      verses,
    };
  }

  /**
   * Retrieve single Ayah by Surah & Ayah number
   */
  static async getAyah(
    surahNumber: number,
    ayahNumber: number,
    translationIds: string = '20,234,831'
  ): Promise<QuranApiVerse> {
    const verseKey = `${surahNumber}:${ayahNumber}`;
    const data = await this.fetchFromApi<{ verse: QuranApiVerse }>(`/verses/by_key/${verseKey}`, {
      fields: 'text_uthmani,text_indopak,text_imlaei,text_uthmani_simple,chapter_id,verse_number,verse_key,page_number,juz_number,hizb_number,rub_el_hizb_number,ruku_number,manzil_number,sajdah_number',
      translations: translationIds,
      language: 'en',
    });

    if (!data.verse) {
      throw new Error(`Ayah ${verseKey} not found.`);
    }

    return data.verse;
  }

  /**
   * Retrieve Juz verses (Juz 1 to 30)
   */
  static async getJuz(
    juzNumber: number,
    page: number = 1,
    translationIds: string = '20,234'
  ): Promise<{
    juz_number: number;
    verses: QuranApiVerse[];
    pagination: any;
  }> {
    if (juzNumber < 1 || juzNumber > 30) {
      throw new Error(`Invalid Juz number ${juzNumber}. Must be between 1 and 30.`);
    }

    const data = await this.fetchFromApi<{
      verses: QuranApiVerse[];
      pagination: any;
    }>(`/verses/by_juz/${juzNumber}`, {
      page,
      per_page: 50,
      fields: 'text_uthmani,text_indopak,text_imlaei,text_uthmani_simple,chapter_id,verse_number,verse_key,page_number,juz_number',
      translations: translationIds,
      language: 'en',
    });

    return {
      juz_number: juzNumber,
      verses: data.verses || [],
      pagination: data.pagination,
    };
  }

  /**
   * Retrieve verses by standard Madani Mushaf Page (1 to 604)
   */
  static async getPage(
    pageNumber: number,
    translationIds: string = '20,234'
  ): Promise<{
    page_number: number;
    verses: QuranApiVerse[];
  }> {
    if (pageNumber < 1 || pageNumber > 604) {
      throw new Error(`Invalid Quran page number ${pageNumber}. Standard Madani Mushaf has pages 1 to 604.`);
    }

    const data = await this.fetchFromApi<{ verses: QuranApiVerse[] }>(`/verses/by_page/${pageNumber}`, {
      per_page: 50,
      fields: 'text_uthmani,text_indopak,text_imlaei,text_uthmani_simple,chapter_id,verse_number,verse_key,page_number,juz_number',
      translations: translationIds,
      language: 'en',
    });

    return {
      page_number: pageNumber,
      verses: data.verses || [],
    };
  }

  /**
   * Retrieve all recitations / audio reciters
   */
  static async getRecitations() {
    const data = await this.fetchFromApi<{ recitations: any[] }>('/resources/recitations');
    return data.recitations || [];
  }

  /**
   * Retrieve all available translations
   */
  static async getTranslations() {
    const data = await this.fetchFromApi<{ translations: any[] }>('/resources/translations', { language: 'en' });
    return data.translations || [];
  }

  /**
   * Retrieve all available Tafsirs
   */
  static async getTafsirs() {
    const data = await this.fetchFromApi<{ tafsirs: any[] }>('/resources/tafsirs', { language: 'en' });
    return data.tafsirs || [];
  }

  /**
   * Safe status report (never leaks secrets)
   */
  static async getApiStatus(): Promise<QuranApiStatus> {
    const token = await this.getAccessToken();
    return {
      provider: this.PROVIDER_NAME,
      clientId: ENV.QURAN_API_CLIENT_ID,
      authMethod: 'OAuth2 Client Credentials Flow (grant_type=client_credentials, scope=content)',
      tokenEndpoint: ENV.QURAN_API_AUTH_URL,
      contentBaseUrl: ENV.QURAN_API_BASE_URL,
      fallbackUrl: ENV.QURAN_API_FALLBACK_URL,
      isAuthenticated: Boolean(token),
      activeBaseUrl: token ? ENV.QURAN_API_BASE_URL : ENV.QURAN_API_FALLBACK_URL,
      rateLimits: token ? '600 req/min (OAuth2 authenticated tier)' : '60-120 req/min (Public tier)',
      licensing: 'Open Islamic content license powered by Tanzil.net & King Fahd Glorious Quran Printing Complex (KFGQPC)',
      supportedMushafPages: 604,
    };
  }
}
