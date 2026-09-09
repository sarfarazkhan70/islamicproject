/**
 * Kanzul Iman Dedicated Service (كنز الإيمان في ترجمة القرآن)
 * ==============================================================================
 * Exclusively provides the authentic Urdu translation of the Holy Quran by:
 * Imam Ahmad Raza Khan Ala Hazrat (رحمۃ اللہ علیہ)
 *
 * Source: Verified 'ur.kanzuliman' canonical digital text
 * ==============================================================================
 */

import { KANZUL_IMAN_FEATURED_SURAHS, kanzulImanPageToLeafIndex } from '../data/kanzulImanData';

export interface KanzulImanAyah {
  ayahNumber: number;
  verseKey: string;
  arabicText: string;
  kanzulImanUrdu: string;
  kanzulImanEnglish: string;
  englishMeaning?: string;
  juzNumber?: number;
  pageNumber?: number;
}

export interface KanzulImanSurahResponse {
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  versesCount: number;
  revelationType: string;
  ayahs: KanzulImanAyah[];
  translatorAttribution: string;
  englishAttribution?: string;
}

const ALQURAN_CLOUD_BASE = 'https://api.alquran.cloud/v1';
const CACHE_PREFIX = 'kanzul_iman_v3_surah_';

// Cleanup legacy caches to prevent serving old/incorrect cached data
try {
  if (typeof localStorage !== 'undefined') {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('kanzul_iman_v1_') || key.startsWith('kanzul_iman_v2_')) {
        localStorage.removeItem(key);
      }
    });
  }
} catch {
  // ignore storage errors
}

// In-memory cache for fast switching
const memoryCache = new Map<number, KanzulImanSurahResponse>();

/**
 * Strips leading Bismillah from Ayah 1 of Surahs 2..114 to prevent duplicate
 * or merged Bismillah inside the Arabic Ayah text.
 */
export function cleanAyahArabicText(rawText: string, surahNumber: number, ayahNumber: number): string {
  if (!rawText || surahNumber === 1 || surahNumber === 9 || ayahNumber !== 1) {
    return rawText;
  }

  const bismillahPatterns = [
    /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u,
    /^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/u,
    /^بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ\s*/u,
    /^بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\s*/u,
    /^بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ\s*/u,
    /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u,
  ];

  let cleaned = rawText.trim();
  for (const pattern of bismillahPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '').trim();
      break;
    }
  }
  return cleaned.length > 0 ? cleaned : rawText;
}

export const KanzulImanService = {
  /**
   * Fetch a complete Surah with authentic Kanzul Iman translation
   */
  async getSurah(surahNumber: number): Promise<KanzulImanSurahResponse> {
    if (surahNumber < 1 || surahNumber > 114) {
      throw new Error(`Invalid Surah number: ${surahNumber}`);
    }

    // 1. Check in-memory cache
    if (memoryCache.has(surahNumber)) {
      return memoryCache.get(surahNumber)!;
    }

    // 2. Check localStorage cache
    try {
      const local = localStorage.getItem(`${CACHE_PREFIX}${surahNumber}`);
      if (local) {
        const parsed: KanzulImanSurahResponse = JSON.parse(local);
        if (parsed && parsed.ayahs && parsed.ayahs.length > 0) {
          // Re-clean Ayah 1 to ensure no stale cached Bismillah prefix
          parsed.ayahs = parsed.ayahs.map((a) => ({
            ...a,
            arabicText: cleanAyahArabicText(a.arabicText, surahNumber, a.ayahNumber),
          }));
          memoryCache.set(surahNumber, parsed);
          return parsed;
        }
      }
    } catch {
      // localStorage quota or unavailable
    }

    // 3. Fetch from verified AlQuran Cloud API (quran-uthmani + ur.kanzuliman + en.ahmedraza)
    try {
      const url = `${ALQURAN_CLOUD_BASE}/surah/${surahNumber}/editions/quran-uthmani,ur.kanzuliman,en.ahmedraza`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch Kanzul Iman for Surah ${surahNumber}`);
      }

      const data = await res.json();
      if (data.code !== 200 || !data.data || data.data.length < 2) {
        throw new Error(`Invalid response format for Surah ${surahNumber}`);
      }

      const arabicEdition = data.data[0];
      const kanzulImanEdition = data.data.find(
        (ed: any) => ed.edition?.identifier === 'ur.kanzuliman'
      ) || data.data[1];
      const englishEdition = data.data.find(
        (ed: any) => ed.edition?.identifier === 'en.ahmedraza'
      ) || data.data.find(
        (ed: any) => ed.edition?.language === 'en'
      );

      const totalAyahs = arabicEdition.ayahs.length;
      const combinedAyahs: KanzulImanAyah[] = [];
      const featuredAyahs = KANZUL_IMAN_FEATURED_SURAHS[surahNumber];

      for (let i = 0; i < totalAyahs; i++) {
        const arAyah = arabicEdition.ayahs[i];
        const urAyah = kanzulImanEdition.ayahs[i];
        const enAyah = englishEdition ? englishEdition.ayahs[i] : undefined;

        const rawArabic = arAyah.text || '';
        const cleanedArabic = cleanAyahArabicText(rawArabic, surahNumber, arAyah.numberInSurah);

        const featuredAyah = featuredAyahs?.find(
          (f) => f.ayahNumber === arAyah.numberInSurah
        );
        const verifiedRefEnglish = featuredAyah?.kanzulImanEnglish || featuredAyah?.englishMeaning;

        const englishText = verifiedRefEnglish || enAyah?.text || '';

        combinedAyahs.push({
          ayahNumber: arAyah.numberInSurah,
          verseKey: `${surahNumber}:${arAyah.numberInSurah}`,
          arabicText: cleanedArabic,
          kanzulImanUrdu: urAyah?.text || '',
          kanzulImanEnglish: englishText,
          englishMeaning: englishText,
          juzNumber: arAyah.juz,
          pageNumber: arAyah.page,
        });
      }

      const result: KanzulImanSurahResponse = {
        surahNumber,
        surahNameArabic: arabicEdition.name,
        surahNameEnglish: arabicEdition.englishName,
        versesCount: arabicEdition.numberOfAyahs,
        revelationType: arabicEdition.revelationType,
        ayahs: combinedAyahs,
        translatorAttribution: 'امام احمد رضا خان بریلوی (اعلیٰ حضرت رحمۃ اللہ علیہ) — کنز الایمان',
        englishAttribution: 'English Translation of Kanz-ul-Iman — Prof. Shah Farid-ul-Haque',
      };

      // Save to caches
      memoryCache.set(surahNumber, result);
      try {
        localStorage.setItem(`${CACHE_PREFIX}${surahNumber}`, JSON.stringify(result));
      } catch {
        // storage quota full
      }

      return result;
    } catch (err) {
      console.warn(`API fetch for Kanzul Iman Surah ${surahNumber} failed, checking local verified fallback:`, err);

      // 4. Fallback to verified local Kanzul Iman dataset
      const fallbackAyahs = KANZUL_IMAN_FEATURED_SURAHS[surahNumber];
      if (fallbackAyahs && fallbackAyahs.length > 0) {
        const result: KanzulImanSurahResponse = {
          surahNumber,
          surahNameArabic: '',
          surahNameEnglish: '',
          versesCount: fallbackAyahs.length,
          revelationType: '',
          ayahs: fallbackAyahs.map((v) => ({
            ayahNumber: v.ayahNumber,
            verseKey: v.verseKey,
            arabicText: v.arabicText,
            kanzulImanUrdu: v.kanzulImanUrdu,
            kanzulImanEnglish: v.kanzulImanEnglish || v.englishMeaning || '',
            englishMeaning: v.kanzulImanEnglish || v.englishMeaning || '',
            juzNumber: v.juzNumber,
            pageNumber: v.pageNumber,
          })),
          translatorAttribution: 'امام احمد رضا خان بریلوی (اعلیٰ حضرت رحمۃ اللہ علیہ) — کنز الایمان',
          englishAttribution: 'Prof. Shah Farid-ul-Haque (Kanz-ul-Iman English Rendering)',
        };
        return result;
      }

      throw err;
    }
  },

  /**
   * Get authentic scanned page image URL of Kanz-ul-Iman with Hashiya Khazain-ul-Irfan
   * Note: strictly maps by UPPER PAGE NUMBER (Upper Page 89 -> n90, Page 90 -> n91, Page 91 -> n92, Page 100 -> n101)
   */
  getKanzulImanPageImageUrl(
    pageNumber: number,
    size: 'desktop' | 'mobile' | 'full' = 'desktop'
  ): string {
    const leafIndex = kanzulImanPageToLeafIndex(pageNumber);

    if (size === 'mobile') {
      return `https://archive.org/download/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan/page/n${leafIndex}_w800.jpg`;
    }
    if (size === 'desktop') {
      return `https://archive.org/download/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan/page/n${leafIndex}_w1200.jpg`;
    }
    return `https://archive.org/download/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan/page/n${leafIndex}.jpg`;
  },

  /**
   * Responsive srcSet string for Kanz-ul-Iman full page images
   */
  getKanzulImanPageSrcSet(pageNumber: number): string {
    const mobileUrl = this.getKanzulImanPageImageUrl(pageNumber, 'mobile');
    const desktopUrl = this.getKanzulImanPageImageUrl(pageNumber, 'desktop');
    return `${mobileUrl} 800w, ${desktopUrl} 1200w`;
  },

  /**
   * Fallback direct high-resolution Kanz-ul-Iman page image URL via BookReader
   */
  getKanzulImanPageFallbackUrl(pageNumber: number): string {
    const leafIndex = kanzulImanPageToLeafIndex(pageNumber);
    const padded = String(leafIndex).padStart(4, '0');
    return `https://ia600404.us.archive.org/BookReader/BookReaderImages.php?zip=/14/items/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan_jp2.zip&file=quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan_jp2/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan_${padded}.jp2&id=quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan&scale=2&rotate=0`;
  },

  /**
   * Fetch verses for an entire Juz / Para with Kanz-ul-Iman translation
   */
  async getJuz(juzNumber: number): Promise<KanzulImanAyah[]> {
    const clamped = Math.max(1, Math.min(30, juzNumber));
    const cacheKey = `kanzul_iman_v3_juz_${clamped}`;

    try {
      const local = localStorage.getItem(cacheKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    try {
      const url = `${ALQURAN_CLOUD_BASE}/juz/${clamped}/editions/quran-uthmani,ur.kanzuliman,en.ahmedraza`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch Juz ${clamped}`);
      const data = await res.json();
      if (data.code !== 200 || !data.data || data.data.length < 2) {
        throw new Error(`Invalid data for Juz ${clamped}`);
      }

      const arabicEd = data.data[0];
      const urduEd = data.data.find((e: any) => e.edition?.identifier === 'ur.kanzuliman') || data.data[1];
      const englishEd = data.data.find((e: any) => e.edition?.identifier === 'en.ahmedraza') || data.data.find((e: any) => e.edition?.language === 'en');

      const result: KanzulImanAyah[] = [];
      for (let i = 0; i < arabicEd.ayahs.length; i++) {
        const ar = arabicEd.ayahs[i];
        const ur = urduEd.ayahs[i];
        const en = englishEd ? englishEd.ayahs[i] : undefined;
        const englishText = en?.text || '';

        result.push({
          ayahNumber: ar.numberInSurah,
          verseKey: `${ar.surah.number}:${ar.numberInSurah}`,
          arabicText: cleanAyahArabicText(ar.text || '', ar.surah.number, ar.numberInSurah),
          kanzulImanUrdu: ur?.text || '',
          kanzulImanEnglish: englishText,
          englishMeaning: englishText,
          juzNumber: ar.juz,
          pageNumber: ar.page,
        });
      }

      try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch {}

      return result;
    } catch (err) {
      console.warn(`Failed to fetch Juz ${clamped} from API:`, err);
      return [];
    }
  },
};

