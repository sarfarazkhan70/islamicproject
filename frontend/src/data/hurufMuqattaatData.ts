/**
 * Huruf-e-Muqatta'at (حروفِ مقطعات) - Disjointed / Mystical Letters
 * Canonical mapping for all 29 Surahs in the Holy Quran that begin with Huruf-e-Muqatta'at.
 */

export interface HurufMuqattaatInfo {
  surahNumber: number;
  surahName: string;
  lettersArabic: string;
  transliteration: string;
  urduPronunciation: string;
  ayahNumbers: number[];
  note?: string;
}

export const HURUF_E_MUQATTAAT: Record<number, HurufMuqattaatInfo> = {
  // 1. Surah Al-Baqarah (2)
  2: {
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    lettersArabic: 'الٓمٓ',
    transliteration: 'Alif Lām Mīm',
    urduPronunciation: 'الف لام میم',
    ayahNumbers: [1],
  },
  // 2. Surah Aal-e-Imran (3)
  3: {
    surahNumber: 3,
    surahName: 'Aal-e-Imran',
    lettersArabic: 'الٓمٓ',
    transliteration: 'Alif Lām Mīm',
    urduPronunciation: 'الف لام میم',
    ayahNumbers: [1],
  },
  // 3. Surah Al-A'raf (7)
  7: {
    surahNumber: 7,
    surahName: "Al-A'raf",
    lettersArabic: 'الٓمٓصٓ',
    transliteration: 'Alif Lām Mīm Ṣād',
    urduPronunciation: 'الف لام میم صاد',
    ayahNumbers: [1],
  },
  // 4. Surah Yunus (10)
  10: {
    surahNumber: 10,
    surahName: 'Yunus',
    lettersArabic: 'الٓر',
    transliteration: 'Alif Lām Rā',
    urduPronunciation: 'الف لام را',
    ayahNumbers: [1],
  },
  // 5. Surah Hud (11)
  11: {
    surahNumber: 11,
    surahName: 'Hud',
    lettersArabic: 'الٓر',
    transliteration: 'Alif Lām Rā',
    urduPronunciation: 'الف لام را',
    ayahNumbers: [1],
  },
  // 6. Surah Yusuf (12)
  12: {
    surahNumber: 12,
    surahName: 'Yusuf',
    lettersArabic: 'الٓر',
    transliteration: 'Alif Lām Rā',
    urduPronunciation: 'الف لام را',
    ayahNumbers: [1],
  },
  // 7. Surah Ar-Ra'd (13)
  13: {
    surahNumber: 13,
    surahName: "Ar-Ra'd",
    lettersArabic: 'الٓمٓر',
    transliteration: 'Alif Lām Mīm Rā',
    urduPronunciation: 'الف لام میم را',
    ayahNumbers: [1],
  },
  // 8. Surah Ibrahim (14)
  14: {
    surahNumber: 14,
    surahName: 'Ibrahim',
    lettersArabic: 'الٓر',
    transliteration: 'Alif Lām Rā',
    urduPronunciation: 'الف لام را',
    ayahNumbers: [1],
  },
  // 9. Surah Al-Hijr (15)
  15: {
    surahNumber: 15,
    surahName: 'Al-Hijr',
    lettersArabic: 'الٓر',
    transliteration: 'Alif Lām Rā',
    urduPronunciation: 'الف لام را',
    ayahNumbers: [1],
  },
  // 10. Surah Maryam (19)
  19: {
    surahNumber: 19,
    surahName: 'Maryam',
    lettersArabic: 'كٓهيعٓصٓ',
    transliteration: 'Kāf Hā Yā ʿAin Ṣād',
    urduPronunciation: 'کاف ہا یا عین صاد',
    ayahNumbers: [1],
  },
  // 11. Surah Taha (20)
  20: {
    surahNumber: 20,
    surahName: 'Taha',
    lettersArabic: 'طٰهٰ',
    transliteration: 'Ṭā Hā',
    urduPronunciation: 'طٰہٰ',
    ayahNumbers: [1],
  },
  // 12. Surah Ash-Shu'ara (26)
  26: {
    surahNumber: 26,
    surahName: "Ash-Shu'ara",
    lettersArabic: 'طٰسٓمٓ',
    transliteration: 'Ṭā Sīn Mīm',
    urduPronunciation: 'طا سین میم',
    ayahNumbers: [1],
  },
  // 13. Surah An-Naml (27)
  27: {
    surahNumber: 27,
    surahName: 'An-Naml',
    lettersArabic: 'طٰسٓ',
    transliteration: 'Ṭā Sīn',
    urduPronunciation: 'طا سین',
    ayahNumbers: [1],
  },
  // 14. Surah Al-Qasas (28)
  28: {
    surahNumber: 28,
    surahName: 'Al-Qasas',
    lettersArabic: 'طٰسٓمٓ',
    transliteration: 'Ṭā Sīn Mīm',
    urduPronunciation: 'طا سین میم',
    ayahNumbers: [1],
  },
  // 15. Surah Al-Ankabut (29)
  29: {
    surahNumber: 29,
    surahName: 'Al-Ankabut',
    lettersArabic: 'الٓمٓ',
    transliteration: 'Alif Lām Mīm',
    urduPronunciation: 'الف لام میم',
    ayahNumbers: [1],
  },
  // 16. Surah Ar-Rum (30)
  30: {
    surahNumber: 30,
    surahName: 'Ar-Rum',
    lettersArabic: 'الٓمٓ',
    transliteration: 'Alif Lām Mīm',
    urduPronunciation: 'الف لام میم',
    ayahNumbers: [1],
  },
  // 17. Surah Luqman (31)
  31: {
    surahNumber: 31,
    surahName: 'Luqman',
    lettersArabic: 'الٓمٓ',
    transliteration: 'Alif Lām Mīm',
    urduPronunciation: 'الف لام میم',
    ayahNumbers: [1],
  },
  // 18. Surah As-Sajdah (32)
  32: {
    surahNumber: 32,
    surahName: 'As-Sajdah',
    lettersArabic: 'الٓمٓ',
    transliteration: 'Alif Lām Mīm',
    urduPronunciation: 'الف لام میم',
    ayahNumbers: [1],
  },
  // 19. Surah Yaseen (36)
  36: {
    surahNumber: 36,
    surahName: 'Yaseen',
    lettersArabic: 'يٰسٓ',
    transliteration: 'Yā Sīn',
    urduPronunciation: 'یٰسٓ',
    ayahNumbers: [1],
  },
  // 20. Surah Saad (38)
  38: {
    surahNumber: 38,
    surahName: 'Saad',
    lettersArabic: 'صٓ',
    transliteration: 'Ṣād',
    urduPronunciation: 'صاد',
    ayahNumbers: [1],
  },
  // 21. Surah Ghafir (40)
  40: {
    surahNumber: 40,
    surahName: 'Ghafir',
    lettersArabic: 'حٰمٓ',
    transliteration: 'Ḥā Mīm',
    urduPronunciation: 'حا میم',
    ayahNumbers: [1],
  },
  // 22. Surah Fussilat (41)
  41: {
    surahNumber: 41,
    surahName: 'Fussilat',
    lettersArabic: 'حٰمٓ',
    transliteration: 'Ḥā Mīm',
    urduPronunciation: 'حا میم',
    ayahNumbers: [1],
  },
  // 23. Surah Ash-Shura (42)
  42: {
    surahNumber: 42,
    surahName: 'Ash-Shura',
    lettersArabic: 'حٰمٓ • عٓسٓقٓ',
    transliteration: 'Ḥā Mīm • ʿAin Sīn Qāf',
    urduPronunciation: 'حا میم • عین سین قاف',
    ayahNumbers: [1, 2],
  },
  // 24. Surah Az-Zukhruf (43)
  43: {
    surahNumber: 43,
    surahName: 'Az-Zukhruf',
    lettersArabic: 'حٰمٓ',
    transliteration: 'Ḥā Mīm',
    urduPronunciation: 'حا میم',
    ayahNumbers: [1],
  },
  // 25. Surah Ad-Dukhan (44)
  44: {
    surahNumber: 44,
    surahName: 'Ad-Dukhan',
    lettersArabic: 'حٰمٓ',
    transliteration: 'Ḥā Mīm',
    urduPronunciation: 'حا میم',
    ayahNumbers: [1],
  },
  // 26. Surah Al-Jathiyah (45)
  45: {
    surahNumber: 45,
    surahName: 'Al-Jathiyah',
    lettersArabic: 'حٰمٓ',
    transliteration: 'Ḥā Mīm',
    urduPronunciation: 'حا میم',
    ayahNumbers: [1],
  },
  // 27. Surah Al-Ahqaf (46)
  46: {
    surahNumber: 46,
    surahName: 'Al-Ahqaf',
    lettersArabic: 'حٰمٓ',
    transliteration: 'Ḥā Mīm',
    urduPronunciation: 'حا میم',
    ayahNumbers: [1],
  },
  // 28. Surah Qaf (50)
  50: {
    surahNumber: 50,
    surahName: 'Qaf',
    lettersArabic: 'قٓ',
    transliteration: 'Qāf',
    urduPronunciation: 'قاف',
    ayahNumbers: [1],
  },
  // 29. Surah Al-Qalam (68)
  68: {
    surahNumber: 68,
    surahName: 'Al-Qalam',
    lettersArabic: 'نٓ',
    transliteration: 'Nūn',
    urduPronunciation: 'نون',
    ayahNumbers: [1],
  },
};

export function getHurufMuqattaatForSurah(surahNumber: number): HurufMuqattaatInfo | null {
  return HURUF_E_MUQATTAAT[surahNumber] || null;
}
