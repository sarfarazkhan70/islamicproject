import fs from 'fs';

const cleanSurahs = JSON.parse(fs.readFileSync('scratch/clean_surahs.json', 'utf8'));

const quranDataContent = `/**
 * Quran Static Metadata and Registries
 * Fully aligned with Quran.com API v4 standard
 * Mushaf PDF Mapping for Zia-ul-Quran / Subcontinent 9-Line Mushaf (1124 pages)
 */

export interface SurahMeta {
  number: number;
  name: string;
  arabicName: string;
  meaning: string;
  versesCount: number;
  revelationType: 'Meccan' | 'Medinan';
  juzStart: number;
  pageStart: number;
}

export interface JuzMeta {
  number: number;
  name: string;
  arabicName: string;
  startSurah: number;
  startSurahName: string;
  startAyah: number;
  pageStart: number;
}

export interface QuranScriptOption {
  id: 'indopak' | 'uthmani' | 'uthmani_tajweed' | 'uthmani_simple' | 'imlaei';
  label: string;
  sublabel: string;
  fontFamily: string;
  sample: string;
}

export interface QuranTranslationOption {
  id: number;
  name: string;
  author: string;
  language: 'urdu' | 'english' | 'hindi' | 'roman-urdu';
  languageLabel: string;
}

export interface QuranReciterOption {
  id: number;
  name: string;
  style?: string;
  reciterSlug: string;
}

export const SUPPORTED_SCRIPTS: QuranScriptOption[] = [
  {
    id: 'indopak',
    label: 'IndoPak (Subcontinent)',
    sublabel: 'Classic Nastaleeq / South Asian Mushaf',
    fontFamily: "'Noorehuda', 'Urdu Typesetting', 'PakType Tehreer', 'Jameel Noori Nastaleeq', serif",
    sample: 'بِسۡمِ اللهِ الرَّحۡمٰنِ الرَّحِيۡمِ',
  },
  {
    id: 'uthmani',
    label: 'Uthmani (Madani)',
    sublabel: 'Standard King Fahd Complex Madinah Mushaf',
    fontFamily: "'KFGQPC Uthmanic Script HAFS', 'Scheherazade New', 'Amiri', serif",
    sample: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
  },
  {
    id: 'uthmani_tajweed',
    label: 'Uthmani Tajweed (Colored)',
    sublabel: 'Color-coded Tajweed pronunciation rules',
    fontFamily: "'KFGQPC Uthmanic Script HAFS', 'Amiri', serif",
    sample: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
  },
  {
    id: 'uthmani_simple',
    label: 'Simple Uthmani',
    sublabel: 'Clean Uthmani text with standard vowel marks',
    fontFamily: "'Amiri', 'Traditional Arabic', serif",
    sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  },
  {
    id: 'imlaei',
    label: 'Imlaei (Modern)',
    sublabel: 'Modern Arabic orthography',
    fontFamily: "'Amiri', 'Arial', sans-serif",
    sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  },
];

export const SUPPORTED_TRANSLATIONS: QuranTranslationOption[] = [
  {
    id: 234,
    name: 'Fatah Muhammad Jalandhari',
    author: 'Fateh Muhammad Jalandhry',
    language: 'urdu',
    languageLabel: 'اردو (جالندھری)',
  },
  {
    id: 54,
    name: 'Maulana Muhammad Junagarhi',
    author: 'Maulana Muhammad Junagarhi',
    language: 'urdu',
    languageLabel: 'اردو (جوناگڑھی)',
  },
  {
    id: 97,
    name: 'Tafheem-ul-Quran',
    author: 'Syed Abul Ala Maududi',
    language: 'urdu',
    languageLabel: 'اردو (تفہیم القرآن - مودودی)',
  },
  {
    id: 158,
    name: 'Bayan-ul-Quran',
    author: 'Dr. Israr Ahmad',
    language: 'urdu',
    languageLabel: 'اردو (بیان القرآن - ڈاکٹر اسرار)',
  },
  {
    id: 831,
    name: 'Roman Urdu (Maududi)',
    author: 'Abul Ala Maududi',
    language: 'roman-urdu',
    languageLabel: 'Roman Urdu (Aasan)',
  },
  {
    id: 20,
    name: 'Saheeh International',
    author: 'Saheeh International',
    language: 'english',
    languageLabel: 'English (Saheeh Int.)',
  },
  {
    id: 85,
    name: 'M.A.S. Abdel Haleem',
    author: 'Oxford University Press',
    language: 'english',
    languageLabel: 'English (Abdel Haleem)',
  },
  {
    id: 84,
    name: 'Mufti Taqi Usmani',
    author: 'Mufti Muhammad Taqi Usmani',
    language: 'english',
    languageLabel: 'English (Taqi Usmani)',
  },
  {
    id: 22,
    name: 'Abdullah Yusuf Ali',
    author: 'A. Yusuf Ali',
    language: 'english',
    languageLabel: 'English (Yusuf Ali)',
  },
  {
    id: 122,
    name: 'Maulana Azizul Haque al-Umari',
    author: 'Azizul Haque al-Umari',
    language: 'hindi',
    languageLabel: 'हिन्दी (अज़ीज़ुल हक़ अल-उमरी)',
  },
];

export const QURAN_COM_RECITERS: QuranReciterOption[] = [
  {
    id: 7,
    name: 'Sheikh Mishary Rashid Alafasy',
    style: 'Murattal (Clear & Melodic)',
    reciterSlug: 'Alafasy',
  },
  {
    id: 2,
    name: 'Sheikh AbdulBaset AbdulSamad',
    style: 'Murattal (Classic Egyptian)',
    reciterSlug: 'AbdulBaset/Murattal',
  },
  {
    id: 1,
    name: 'Sheikh AbdulBaset AbdulSamad',
    style: 'Mujawwad (Masterful Tajweed)',
    reciterSlug: 'AbdulBaset/Mujawwad',
  },
  {
    id: 6,
    name: 'Sheikh Mahmoud Khalil Al-Husary',
    style: 'Murattal (Authoritative)',
    reciterSlug: 'Husary',
  },
  {
    id: 12,
    name: 'Sheikh Mahmoud Khalil Al-Husary',
    style: 'Muallim (Teacher Style)',
    reciterSlug: 'Husary/Muallim',
  },
  {
    id: 3,
    name: 'Sheikh Abdur-Rahman as-Sudais',
    style: 'Imam of Masjid al-Haram, Makkah',
    reciterSlug: 'Sudais',
  },
  {
    id: 9,
    name: 'Sheikh Mohamed Siddiq al-Minshawi',
    style: 'Murattal (Deep & Soulful)',
    reciterSlug: 'Minshawi/Murattal',
  },
  {
    id: 8,
    name: 'Sheikh Mohamed Siddiq al-Minshawi',
    style: 'Mujawwad (Classical Egyptian)',
    reciterSlug: 'Minshawi/Mujawwad',
  },
  {
    id: 4,
    name: 'Sheikh Abu Bakr al-Shatri',
    style: 'Murattal',
    reciterSlug: 'Shatri',
  },
  {
    id: 5,
    name: 'Sheikh Hani ar-Rifai',
    style: 'Emotional & Moving',
    reciterSlug: 'Rifai',
  },
  {
    id: 10,
    name: 'Sheikh Sa\`ud ash-Shuraym',
    style: 'Imam of Masjid al-Haram, Makkah',
    reciterSlug: 'Shuraym',
  },
];

// Complete 114 Surahs Directory with verified Zia-ul-Quran 9-line Mushaf PDF page starts (1-1124)
export const SURAHS_LIST: SurahMeta[] = ${JSON.stringify(cleanSurahs, null, 2)};

// 30 Juz Index with verified Zia-ul-Quran 9-line Mushaf PDF page starts (1-1124) - UNCHANGED
export const JUZ_LIST: JuzMeta[] = [
  {
    "number": 1,
    "name": "Juz 1 (الم)",
    "arabicName": "الجزء الأول (الم)",
    "startSurah": 1,
    "startSurahName": "Al-Fatihah",
    "startAyah": 1,
    "pageStart": 3
  },
  {
    "number": 2,
    "name": "Juz 2 (سیقول)",
    "arabicName": "الجزء الثاني (سیقول)",
    "startSurah": 2,
    "startSurahName": "Al-Baqarah",
    "startAyah": 142,
    "pageStart": 41
  },
  {
    "number": 3,
    "name": "Juz 3 (تلك الرسل)",
    "arabicName": "الجزء الثالث (تلك الرسل)",
    "startSurah": 2,
    "startSurahName": "Al-Baqarah",
    "startAyah": 253,
    "pageStart": 78
  },
  {
    "number": 4,
    "name": "Juz 4 (لن تنالوا)",
    "arabicName": "الجزء الرابع (لن تنالوا)",
    "startSurah": 3,
    "startSurahName": "Ali 'Imran",
    "startAyah": 93,
    "pageStart": 115
  },
  {
    "number": 5,
    "name": "Juz 5 (والمحصنات)",
    "arabicName": "الجزء الخامس (والمحصنات)",
    "startSurah": 4,
    "startSurahName": "An-Nisa",
    "startAyah": 24,
    "pageStart": 152
  },
  {
    "number": 6,
    "name": "Juz 6 (لا يحب الله)",
    "arabicName": "الجزء السادس (لا يحب الله)",
    "startSurah": 4,
    "startSurahName": "An-Nisa",
    "startAyah": 148,
    "pageStart": 189
  },
  {
    "number": 7,
    "name": "Juz 7 (وإذا سمعوا)",
    "arabicName": "الجزء السابع (وإذا سمعوا)",
    "startSurah": 5,
    "startSurahName": "Al-Ma'idah",
    "startAyah": 82,
    "pageStart": 226
  },
  {
    "number": 8,
    "name": "Juz 8 (ولو أننا)",
    "arabicName": "الجزء الثامن (ولو أننا)",
    "startSurah": 6,
    "startSurahName": "Al-An'am",
    "startAyah": 111,
    "pageStart": 263
  },
  {
    "number": 9,
    "name": "Juz 9 (قال الملأ)",
    "arabicName": "الجزء التاسع (قال الملأ)",
    "startSurah": 7,
    "startSurahName": "Al-A'raf",
    "startAyah": 88,
    "pageStart": 300
  },
  {
    "number": 10,
    "name": "Juz 10 (واعلموا)",
    "arabicName": "الجزء العاشر (واعلموا)",
    "startSurah": 8,
    "startSurahName": "Al-Anfal",
    "startAyah": 41,
    "pageStart": 337
  },
  {
    "number": 11,
    "name": "Juz 11 (يعتذرون)",
    "arabicName": "الجزء الحادي عشر (يعتذرون)",
    "startSurah": 9,
    "startSurahName": "At-Tawbah",
    "startAyah": 93,
    "pageStart": 374
  },
  {
    "number": 12,
    "name": "Juz 12 (وما من دابة)",
    "arabicName": "الجزء الثاني عشر (وما من دابة)",
    "startSurah": 11,
    "startSurahName": "Hud",
    "startAyah": 6,
    "pageStart": 411
  },
  {
    "number": 13,
    "name": "Juz 13 (وما أبرئ)",
    "arabicName": "الجزء الثالث عشر (وما أبرئ)",
    "startSurah": 12,
    "startSurahName": "Yusuf",
    "startAyah": 53,
    "pageStart": 448
  },
  {
    "number": 14,
    "name": "Juz 14 (ربما)",
    "arabicName": "الجزء الرابع عشر (ربما)",
    "startSurah": 15,
    "startSurahName": "Al-Hijr",
    "startAyah": 1,
    "pageStart": 485
  },
  {
    "number": 15,
    "name": "Juz 15 (سبحان الذي)",
    "arabicName": "الجزء الخامس عشر (سبحان الذي)",
    "startSurah": 17,
    "startSurahName": "Al-Isra",
    "startAyah": 1,
    "pageStart": 522
  },
  {
    "number": 16,
    "name": "Juz 16 (قال ألم)",
    "arabicName": "الجزء السادس عشر (قال ألم)",
    "startSurah": 18,
    "startSurahName": "Al-Kahf",
    "startAyah": 75,
    "pageStart": 559
  },
  {
    "number": 17,
    "name": "Juz 17 (اقترب)",
    "arabicName": "الجزء السابع عشر (اقترب)",
    "startSurah": 21,
    "startSurahName": "Al-Anbiya",
    "startAyah": 1,
    "pageStart": 596
  },
  {
    "number": 18,
    "name": "Juz 18 (قد أفلح)",
    "arabicName": "الجزء الثامن عشر (قد أفلح)",
    "startSurah": 23,
    "startSurahName": "Al-Mu'minun",
    "startAyah": 1,
    "pageStart": 633
  },
  {
    "number": 19,
    "name": "Juz 19 (وقال الذين)",
    "arabicName": "الجزء التاسع عشر (وقال الذين)",
    "startSurah": 25,
    "startSurahName": "Al-Furqan",
    "startAyah": 21,
    "pageStart": 670
  },
  {
    "number": 20,
    "name": "Juz 20 (أمن خلق)",
    "arabicName": "الجزء العشرون (أمن خلق)",
    "startSurah": 27,
    "startSurahName": "An-Naml",
    "startAyah": 56,
    "pageStart": 707
  },
  {
    "number": 21,
    "name": "Juz 21 (اتل ما أوحي)",
    "arabicName": "الجزء الحادي والعشرون (اتل ما أوحي)",
    "startSurah": 29,
    "startSurahName": "Al-'Ankabut",
    "startAyah": 46,
    "pageStart": 744
  },
  {
    "number": 22,
    "name": "Juz 22 (ومن يقنت)",
    "arabicName": "الجزء الثاني والعشرون (ومن يقنت)",
    "startSurah": 33,
    "startSurahName": "Al-Ahzab",
    "startAyah": 31,
    "pageStart": 781
  },
  {
    "number": 23,
    "name": "Juz 23 (وما أنزلنا)",
    "arabicName": "الجزء الثالث والعشرون (وما أنزلنا)",
    "startSurah": 36,
    "startSurahName": "Ya-Sin",
    "startAyah": 28,
    "pageStart": 818
  },
  {
    "number": 24,
    "name": "Juz 24 (فمن أظلم)",
    "arabicName": "الجزء الرابع والعشرون (فمن أظلم)",
    "startSurah": 39,
    "startSurahName": "Az-Zumar",
    "startAyah": 32,
    "pageStart": 855
  },
  {
    "number": 25,
    "name": "Juz 25 (إليه يرد)",
    "arabicName": "الجزء الخامس والعشرون (إليه يرد)",
    "startSurah": 41,
    "startSurahName": "Fussilat",
    "startAyah": 47,
    "pageStart": 892
  },
  {
    "number": 26,
    "name": "Juz 26 (حم)",
    "arabicName": "الجزء السادس والعشرون (حم)",
    "startSurah": 46,
    "startSurahName": "Al-Ahqaf",
    "startAyah": 1,
    "pageStart": 929
  },
  {
    "number": 27,
    "name": "Juz 27 (قال فما خطبكم)",
    "arabicName": "الجزء السابع والعشرون (قال فما خطبكم)",
    "startSurah": 51,
    "startSurahName": "Adh-Dhariyat",
    "startAyah": 31,
    "pageStart": 966
  },
  {
    "number": 28,
    "name": "Juz 28 (قد سمع الله)",
    "arabicName": "الجزء الثامن والعشرون (قد سمع الله)",
    "startSurah": 58,
    "startSurahName": "Al-Mujadila",
    "startAyah": 1,
    "pageStart": 1003
  },
  {
    "number": 29,
    "name": "Juz 29 (تبارك الذي)",
    "arabicName": "الجزء التاسع والعشرون (تبارك الذي)",
    "startSurah": 67,
    "startSurahName": "Al-Mulk",
    "startAyah": 1,
    "pageStart": 1044
  },
  {
    "number": 30,
    "name": "Juz 30 (عم يتساءلون)",
    "arabicName": "الجزء الثلاثون (عم يتساءلون)",
    "startSurah": 78,
    "startSurahName": "An-Naba",
    "startAyah": 1,
    "pageStart": 1085
  }
];

export const TOTAL_MUSHAF_PDF_PAGES = 1124;
export const QURAN_PDF_PATH = '/quran/quran.pdf';

// 30 Para Green Cover PDF Pages
export const PARA_COVER_PDF_PAGES = [
  1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
  373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
  743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
];

export function isCoverPage(pdfPage: number): boolean {
  return PARA_COVER_PDF_PAGES.includes(pdfPage);
}

export function getPrintedPageLabel(pdfPage: number): string {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, pdfPage));
  if (clamped === 1) return 'Cover (Juz 1)';
  if (clamped === 2) return 'Title Page';
  if (clamped === 1124) return 'Dua Khatm-ul-Quran';
  
  const coverIndex = PARA_COVER_PDF_PAGES.indexOf(clamped);
  if (coverIndex !== -1) {
    return 'Cover (Juz ' + (coverIndex + 1) + ')';
  }

  let coversBefore = 0;
  for (const c of PARA_COVER_PDF_PAGES) {
    if (c < clamped) coversBefore++;
    else break;
  }
  
  const printedNum = clamped - coversBefore;
  return 'Page ' + printedNum;
}

export function getMushafPageUrl(pageNumber: number): string {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, pageNumber));
  const padded = String(clamped).padStart(4, '0');
  return 'https://android.quran.com/data/width_1260/page' + padded + '.png';
}

export function getMushafPageFallbackUrl(pageNumber: number): string {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, pageNumber));
  const padded = String(clamped).padStart(4, '0');
  return 'https://raw.githubusercontent.com/thetruerevival/quran-images/master/images/page' + padded + '.png';
}

export function getSurahByPage(pageNumber: number): SurahMeta {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, pageNumber));
  let matched = SURAHS_LIST[0];
  for (const s of SURAHS_LIST) {
    if (s.pageStart <= clamped) {
      matched = s;
    } else {
      break;
    }
  }
  return matched;
}

export function getJuzByPage(pageNumber: number): JuzMeta {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, pageNumber));
  let matched = JUZ_LIST[0];
  for (const j of JUZ_LIST) {
    if (j.pageStart <= clamped) {
      matched = j;
    } else {
      break;
    }
  }
  return matched;
}

export function getSurahByNumber(surahNumber: number): SurahMeta {
  return SURAHS_LIST.find((s) => s.number === surahNumber) || SURAHS_LIST[0];
}
`;

fs.writeFileSync('src/data/quranData.ts', quranDataContent);
console.log('Successfully generated src/data/quranData.ts');
