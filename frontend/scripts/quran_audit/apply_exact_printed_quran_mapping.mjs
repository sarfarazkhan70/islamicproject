import fs from 'fs';
import path from 'path';

// Verified Physical Start Pages for all 114 Surahs in quran.pdf
const SURAH_PHYSICAL_PAGES = [
  2, 3, 92, 144, 197, 240, 280, 329, 349, 386,       // 1-10
  409, 435, 461, 472, 485, 494, 522, 543, 564, 577,  // 11-20
  596, 614, 633, 649, 664, 679, 697, 712, 731, 746,  // 21-30
  759, 767, 772, 790, 801, 812, 825, 837, 846, 863,  // 31-40
  882, 893, 904, 917, 923, 929, 939, 946, 954, 960,  // 41-50
  966, 971, 976, 980, 985, 991, 997, 1004, 1010, 1016, // 51-60
  1021, 1024, 1026, 1028, 1032, 1035, 1044, 1048, 1051, 1053, // 61-70
  1060, 1062, 1065, 1067, 1073, 1077, 1081, 1085, 1088, 1090, // 71-80
  1092, 1094, 1098, 1099, 1101, 1102, 1106, 1107, 1109, 1111, // 81-90
  1112, 1113, 1114, 1115, 1116, 1117, 1118, 1118, 1119, 1120, // 91-100
  1120, 1121, 1121, 1122, 1122, 1122, 1123, 1123, 1123, 1123, // 101-110
  1123, 1123, 1123, 1123                                       // 111-114
];

// Verified Physical Start Pages for 30 Juz in quran.pdf
const JUZ_PHYSICAL_PAGES = [
  2, 41, 78, 115, 152, 189, 226, 263, 300, 337,
  374, 411, 448, 485, 522, 559, 596, 633, 670, 707,
  744, 781, 818, 855, 892, 929, 966, 1003, 1044, 1085
];

const PARA_COVER_PDF_PAGES = [
  1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
  373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
  743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
];

const TOTAL_QURAN_TEXT_PAGES = 1094;

function pdfPageToQuranTextPage(pdfPage) {
  const clamped = Math.max(1, Math.min(1124, pdfPage));
  const precedingCovers = PARA_COVER_PDF_PAGES.filter(c => c <= clamped).length;
  return Math.max(1, Math.min(TOTAL_QURAN_TEXT_PAGES, clamped - precedingCovers));
}

// Let's import existing data
const quranData = await import('./src/data/quranData.ts');
const surahs = quranData.SURAHS_LIST;
const juzs = quranData.JUZ_LIST;

for (let i = 0; i < surahs.length; i++) {
  surahs[i].pageStart = pdfPageToQuranTextPage(SURAH_PHYSICAL_PAGES[i]);
}

for (let j = 0; j < juzs.length; j++) {
  juzs[j].pageStart = pdfPageToQuranTextPage(JUZ_PHYSICAL_PAGES[j]);
}

const fileHeader = `/**
 * Quran Static Metadata and Registries
 * Fully aligned with Quran.com API v4 standard
 * Mushaf PDF Mapping for Zia-ul-Quran / Subcontinent 9-Line Mushaf (1094 Quran Text Pages, 1124 PDF Pages with 30 Green Para Covers)
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

export const SUPPORTED_SCRIPTS: QuranScriptOption[] = ${JSON.stringify(quranData.SUPPORTED_SCRIPTS, null, 2)};

export const SUPPORTED_TRANSLATIONS: QuranTranslationOption[] = ${JSON.stringify(quranData.SUPPORTED_TRANSLATIONS, null, 2)};

export const QURAN_COM_RECITERS: QuranReciterOption[] = ${JSON.stringify(quranData.QURAN_COM_RECITERS, null, 2)};

// Complete 114 Surahs Directory with exact printed Quran page starts (1 to 1094)
export const SURAHS_LIST: SurahMeta[] = ${JSON.stringify(surahs, null, 2)};

// 30 Paras / Juz Directory with exact printed Quran page starts (1 to 1094)
export const JUZ_LIST: JuzMeta[] = ${JSON.stringify(juzs, null, 2)};

export const TOTAL_MUSHAF_PDF_PAGES = 1094;
export const PDF_PHYSICAL_TOTAL_PAGES = 1124;
export const QURAN_PDF_PATH = '/quran/quran.pdf';

// 30 Para Green Cover Physical PDF Pages
export const PARA_COVER_PDF_PAGES = [
  1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
  373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
  743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
];

/**
 * Convert Printed Quran Page Number (1 to 1094) into Physical PDF Page Number (1 to 1124)
 */
export function quranTextPageToPdfPage(textPageNumber: number): number {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, Math.floor(textPageNumber) || 1));
  let pdfPage = clamped;
  for (const coverPdfPage of PARA_COVER_PDF_PAGES) {
    if (pdfPage >= coverPdfPage) {
      pdfPage++;
    } else {
      break;
    }
  }
  return pdfPage;
}

/**
 * Convert Physical PDF Page Number (1 to 1124) into Printed Quran Page Number (1 to 1094)
 */
export function pdfPageToQuranTextPage(physicalPdfPage: number): number {
  const clamped = Math.max(1, Math.min(PDF_PHYSICAL_TOTAL_PAGES, Math.floor(physicalPdfPage) || 1));
  const precedingCovers = PARA_COVER_PDF_PAGES.filter((c) => c <= clamped).length;
  return Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, clamped - precedingCovers));
}

export function isCoverPage(physicalPdfPage: number): boolean {
  return PARA_COVER_PDF_PAGES.includes(physicalPdfPage);
}

export function getPrintedPageLabel(textPageNumber: number): string {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, textPageNumber));
  return \`Page \${clamped} / \${TOTAL_MUSHAF_PDF_PAGES}\`;
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

export function getSurahByPage(textPageNumber: number): SurahMeta {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, textPageNumber));
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

export function getJuzByPage(textPageNumber: number): JuzMeta {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, textPageNumber));
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

fs.writeFileSync('src/data/quranData.ts', fileHeader);
console.log('Successfully regenerated src/data/quranData.ts with exact 1094 printed Quran page mapping!');
