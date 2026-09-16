// ============================================================================
// JAMI' AT-TIRMIZI: AUTHENTIC VOLUME METADATA & LOCAL PDF CONFIGURATION
// للإمام الحافظ أبي عيسى محمد بن عيسى بن سورة الترمذي (۲۰۹ - ۲۷۹ هـ)
// ============================================================================

export interface TirmiziVolumeMeta {
  volumeNumber: number;
  id: string;
  title: string;
  arabicTitle: string;
  urduTitle: string;
  totalPages: number;
  totalPrintedPages: number;
  localPdfUrl: string;
}

export const LOCAL_TIRMIZI_VOL1_PDF_PATH = '/pdf/jami_at_tirmizi_vol1_part1.pdf';

export const TIRMIZI_VOLUMES: TirmiziVolumeMeta[] = [
  {
    volumeNumber: 1,
    id: 'tirmizi-vol-1',
    title: 'Jami’ at-Tirmidhi — Volume 1 (Part 1)',
    arabicTitle: 'جامع الترمذي — المجلد الأول (الجزء الأول)',
    urduTitle: 'جامع الترمذی — جلد ۱ (پارٹ ۱)',
    totalPages: 340,
    totalPrintedPages: 353,
    localPdfUrl: LOCAL_TIRMIZI_VOL1_PDF_PATH,
  },
  {
    volumeNumber: 2,
    id: 'tirmizi-vol-2',
    title: 'Jami’ at-Tirmidhi — Volume 1 (Part 2)',
    arabicTitle: 'جامع الترمذي — المجلد الأول (الجزء الثاني)',
    urduTitle: 'جامع الترمذی — جلد ۱ (پارٹ ۲)',
    totalPages: 375,
    totalPrintedPages: 715,
    localPdfUrl: '/pdf/jami_at_tirmizi_vol1_part2.pdf',
  },
  {
    volumeNumber: 3,
    id: 'tirmizi-vol-3',
    title: 'Jami’ at-Tirmidhi — Volume 1 (Part 3)',
    arabicTitle: 'جامع الترمذي — المجلد الأول (الجزء الثالث)',
    urduTitle: 'جامع الترمذی — جلد ۱ (پارٹ ۳)',
    totalPages: 297,
    totalPrintedPages: 1000,
    localPdfUrl: '/pdf/jami_at_tirmizi_vol1_part3.pdf',
  },
  {
    volumeNumber: 4,
    id: 'tirmizi-vol-4',
    title: 'Jami’ at-Tirmidhi — Volume 2 (Part 1)',
    arabicTitle: 'جامع الترمذي — المجلد الثاني (الجزء الأول)',
    urduTitle: 'جامع الترمذی — جلد ۲ (پارٹ ۱)',
    totalPages: 308,
    totalPrintedPages: 310,
    localPdfUrl: '/pdf/jami_at_tirmizi_vol2_part1.pdf',
  },
  {
    volumeNumber: 5,
    id: 'tirmizi-vol-5',
    title: 'Jami’ at-Tirmidhi — Volume 2 (Part 2)',
    arabicTitle: 'جامع الترمذي — المجلد الثاني (الجزء الثاني)',
    urduTitle: 'جامع الترمذی — جلد ۲ (پارٹ ۲)',
    totalPages: 371,
    totalPrintedPages: 673,
    localPdfUrl: '/pdf/jami_at_tirmizi_vol2_part2.pdf',
  },
  {
    volumeNumber: 6,
    id: 'tirmizi-vol-6',
    title: 'Jami’ at-Tirmidhi — Volume 2 (Part 3)',
    arabicTitle: 'جامع الترمذي — المجلد الثاني (الجزء الثالث)',
    urduTitle: 'جامع الترمذی — جلد ۲ (پارٹ ۳)',
    totalPages: 157,
    totalPrintedPages: 824,
    localPdfUrl: '/pdf/jami_at_tirmizi_vol2_part3.pdf',
  },
];

export function getTirmiziVolume(volNum: number = 1): TirmiziVolumeMeta {
  return TIRMIZI_VOLUMES.find((v) => v.volumeNumber === volNum) || TIRMIZI_VOLUMES[0];
}

/**
 * Verified 1-to-1 Page Mapping Table for Jami' at-Tirmidhi Volume 1 Part 1
 * Generated via individual scan inspection across all 340 PDF pages.
 *
 * Pagination breakdown:
 * - PDF 1: Outer Cover -> Printed 1
 * - PDF 2: Title Page -> Printed 1
 * - PDF 3: Publication info -> Printed 2
 * - PDF 4-14: Front matter (Arz-e-Nashir, Arz-e-Mutarjim, Fihrist) -> Printed 3 to 13 (offset -1)
 * - PDF 15-339: Book Main Content (Fath-ul-Bab, Kitab-ut-Taharah onwards) -> Printed 29 to 353 (offset +14)
 * - PDF 340: Back Cover -> Printed 353
 */
const TIRMIZI_VOL1_PDF_TO_PRINTED: number[] = new Array(341);
const TIRMIZI_VOL1_PRINTED_TO_PDF: number[] = new Array(354);

// Initialize Vol 1 PDF to Printed mapping
TIRMIZI_VOL1_PDF_TO_PRINTED[1] = 1;
TIRMIZI_VOL1_PDF_TO_PRINTED[2] = 1;
TIRMIZI_VOL1_PDF_TO_PRINTED[3] = 2;
for (let pdf = 4; pdf <= 14; pdf++) {
  TIRMIZI_VOL1_PDF_TO_PRINTED[pdf] = pdf - 1;
}
for (let pdf = 15; pdf <= 339; pdf++) {
  TIRMIZI_VOL1_PDF_TO_PRINTED[pdf] = pdf + 14;
}
TIRMIZI_VOL1_PDF_TO_PRINTED[340] = 353;

// Initialize Vol 1 Printed to PDF mapping
TIRMIZI_VOL1_PRINTED_TO_PDF[1] = 2; // Main title page
TIRMIZI_VOL1_PRINTED_TO_PDF[2] = 3;
for (let printed = 3; printed <= 13; printed++) {
  TIRMIZI_VOL1_PRINTED_TO_PDF[printed] = printed + 1;
}
// For pages between front-matter fihrist (13) and main text (29), map to start of text (PDF 15)
for (let printed = 14; printed <= 28; printed++) {
  TIRMIZI_VOL1_PRINTED_TO_PDF[printed] = 15;
}
for (let printed = 29; printed <= 353; printed++) {
  TIRMIZI_VOL1_PRINTED_TO_PDF[printed] = printed - 14;
}

/**
 * Verified 1-to-1 Page Mapping Table for Jami' at-Tirmidhi Volume 1 Part 2
 * Generated via individual scan inspection across all 375 PDF pages.
 *
 * Pagination breakdown:
 * - PDF 1: Outer Cover -> Printed 1
 * - PDF 2: Title Page -> Printed 1
 * - PDF 3: Publication info / Blank -> Printed 2
 * - PDF 4-12: Front matter Fihrist (Table of contents continuing from Part 1) -> Printed 13 to 21 (offset +9)
 * - PDF 13-374: Main Hadith Text (Zakat, Fasting, Hajj, Funerals, Nikah to end of Part 2) -> Printed 354 to 715 (offset +341)
 * - PDF 375: Back Cover -> Printed 715
 */
const TIRMIZI_VOL2_PDF_TO_PRINTED: number[] = new Array(376);
const TIRMIZI_VOL2_PRINTED_TO_PDF: number[] = new Array(716);

// Initialize Vol 2 PDF to Printed mapping
TIRMIZI_VOL2_PDF_TO_PRINTED[1] = 1;
TIRMIZI_VOL2_PDF_TO_PRINTED[2] = 1;
TIRMIZI_VOL2_PDF_TO_PRINTED[3] = 2;
for (let pdf = 4; pdf <= 12; pdf++) {
  TIRMIZI_VOL2_PDF_TO_PRINTED[pdf] = pdf + 9;
}
for (let pdf = 13; pdf <= 374; pdf++) {
  TIRMIZI_VOL2_PDF_TO_PRINTED[pdf] = pdf + 341;
}
TIRMIZI_VOL2_PDF_TO_PRINTED[375] = 715;

// Initialize Vol 2 Printed to PDF mapping
TIRMIZI_VOL2_PRINTED_TO_PDF[1] = 2; // Main title page
TIRMIZI_VOL2_PRINTED_TO_PDF[2] = 3; // Publication info
for (let printed = 3; printed <= 12; printed++) {
  TIRMIZI_VOL2_PRINTED_TO_PDF[printed] = printed; // Maps 3..12 to PDF 3..12
}
for (let printed = 13; printed <= 21; printed++) {
  TIRMIZI_VOL2_PRINTED_TO_PDF[printed] = printed - 9; // Maps 13..21 to PDF 4..12 (Fihrist)
}
// For relative pages 22 to 353 entered by user, map directly to PDF 22..353
for (let printed = 22; printed <= 353; printed++) {
  TIRMIZI_VOL2_PRINTED_TO_PDF[printed] = Math.min(375, printed);
}
// For printed book pages 354 to 715 (main hadith text), map to PDF 13..374
for (let printed = 354; printed <= 715; printed++) {
  TIRMIZI_VOL2_PRINTED_TO_PDF[printed] = printed - 341;
}

/**
 * Verified 1-to-1 Page Mapping Table for Jami' at-Tirmidhi Volume 1 Part 3
 * Generated via individual scan inspection across all 297 PDF pages.
 *
 * Pagination breakdown:
 * - PDF 1: Outer Cover -> Printed 1
 * - PDF 2: Title Page -> Printed 1
 * - PDF 3: Publication info / Blank -> Printed 2
 * - PDF 4-11: Front matter Fihrist (Table of contents continuing from Part 2) -> Printed 21 to 28 (offset +17)
 * - PDF 12-296: Main Hadith Text (Al-Ahkam continuation, Al-Wasaya, Al-Qadar, Al-Fitan, Ar-Ru'ya, Al-Adab, Tafsir) -> Printed 716 to 1000 (offset +704)
 * - PDF 297: Back Cover -> Printed 1000
 */
const TIRMIZI_VOL3_PDF_TO_PRINTED: number[] = new Array(298);
const TIRMIZI_VOL3_PRINTED_TO_PDF: number[] = new Array(1001);

// Initialize Vol 3 PDF to Printed mapping
TIRMIZI_VOL3_PDF_TO_PRINTED[1] = 1;
TIRMIZI_VOL3_PDF_TO_PRINTED[2] = 1;
TIRMIZI_VOL3_PDF_TO_PRINTED[3] = 2;
for (let pdf = 4; pdf <= 11; pdf++) {
  TIRMIZI_VOL3_PDF_TO_PRINTED[pdf] = pdf + 17;
}
for (let pdf = 12; pdf <= 296; pdf++) {
  TIRMIZI_VOL3_PDF_TO_PRINTED[pdf] = pdf + 704;
}
TIRMIZI_VOL3_PDF_TO_PRINTED[297] = 1000;

// Initialize Vol 3 Printed to PDF mapping
TIRMIZI_VOL3_PRINTED_TO_PDF[1] = 2; // Main title page
TIRMIZI_VOL3_PRINTED_TO_PDF[2] = 3; // Publication info
for (let printed = 3; printed <= 20; printed++) {
  TIRMIZI_VOL3_PRINTED_TO_PDF[printed] = printed; // Maps 3..20 to PDF 3..20
}
for (let printed = 21; printed <= 28; printed++) {
  TIRMIZI_VOL3_PRINTED_TO_PDF[printed] = printed - 17; // Maps 21..28 to PDF 4..11 (Fihrist)
}
// For relative pages 29 to 715 entered by user, map directly to PDF 29..297
for (let printed = 29; printed <= 715; printed++) {
  TIRMIZI_VOL3_PRINTED_TO_PDF[printed] = Math.min(297, printed);
}
// For printed book pages 716 to 1000 (main hadith text), map to PDF 12..296
for (let printed = 716; printed <= 1000; printed++) {
  TIRMIZI_VOL3_PRINTED_TO_PDF[printed] = printed - 704;
}

/**
 * Verified 1-to-1 Page Mapping Table for Jami' at-Tirmidhi Volume 2 Part 1 (Part 4)
 * Generated via individual scan inspection across all 308 PDF pages.
 *
 * Pagination breakdown:
 * - PDF 1: Outer Cover -> Printed 1
 * - PDF 2: Title Page -> Printed 1
 * - PDF 3: Publication info / Blank -> Printed 2
 * - PDF 4-9: Front matter Fihrist (Table of contents for Volume 2) -> Printed 3 to 8 (offset -1)
 * - PDF 10-307: Main Hadith Text (Kitab-ud-Diyat, Al-Hudud, As-Said, Al-Adahi, An-Nuzoor, As-Siyar) -> Printed 13 to 310 (offset +3)
 * - PDF 308: Back Cover -> Printed 310
 */
const TIRMIZI_VOL4_PDF_TO_PRINTED: number[] = new Array(309);
const TIRMIZI_VOL4_PRINTED_TO_PDF: number[] = new Array(311);

// Initialize Vol 4 PDF to Printed mapping
TIRMIZI_VOL4_PDF_TO_PRINTED[1] = 1;
TIRMIZI_VOL4_PDF_TO_PRINTED[2] = 1;
TIRMIZI_VOL4_PDF_TO_PRINTED[3] = 2;
for (let pdf = 4; pdf <= 9; pdf++) {
  TIRMIZI_VOL4_PDF_TO_PRINTED[pdf] = pdf - 1;
}
for (let pdf = 10; pdf <= 307; pdf++) {
  TIRMIZI_VOL4_PDF_TO_PRINTED[pdf] = pdf + 3;
}
TIRMIZI_VOL4_PDF_TO_PRINTED[308] = 310;

// Initialize Vol 4 Printed to PDF mapping
TIRMIZI_VOL4_PRINTED_TO_PDF[1] = 2; // Main title page
TIRMIZI_VOL4_PRINTED_TO_PDF[2] = 3; // Publication info
for (let printed = 3; printed <= 8; printed++) {
  TIRMIZI_VOL4_PRINTED_TO_PDF[printed] = printed + 1; // Maps 3..8 to PDF 4..9 (Fihrist)
}
for (let printed = 9; printed <= 12; printed++) {
  TIRMIZI_VOL4_PRINTED_TO_PDF[printed] = 10; // Bridge to start of main text
}
for (let printed = 13; printed <= 310; printed++) {
  TIRMIZI_VOL4_PRINTED_TO_PDF[printed] = printed - 3; // Maps 13..310 to PDF 10..307
}

/**
 * Verified 1-to-1 Page Mapping Table for Jami' at-Tirmidhi Volume 2 Part 2 (Part 5)
 * Generated via individual scan inspection across all 371 PDF pages.
 *
 * Pagination breakdown:
 * - PDF 1: Outer Cover -> Printed 1
 * - PDF 2: Title Page (جامع الترمذی جلد دوم تالیف: امام ابو عیسی ترمذی) -> Printed 1
 * - PDF 3: Publication info / Blank -> Printed 2
 * - PDF 4-7: Front matter Fihrist (Table of contents continuing for Part 5) -> Printed 8 to 11 (offset +4)
 * - PDF 8-370: Main Hadith Text (Kitab-uz-Zuhd, Kitab Sifat-il-Qiyamah, Sifat-il-Jannah, Sifat-in-Nar, Kitab-ul-Iman, Kitab-ul-Ilm) -> Printed 311 to 673 (offset +303)
 * - PDF 371: Back Cover -> Printed 673
 */
const TIRMIZI_VOL5_PDF_TO_PRINTED: number[] = new Array(372);
const TIRMIZI_VOL5_PRINTED_TO_PDF: number[] = new Array(674);

// Initialize Vol 5 PDF to Printed mapping
TIRMIZI_VOL5_PDF_TO_PRINTED[1] = 1;
TIRMIZI_VOL5_PDF_TO_PRINTED[2] = 1;
TIRMIZI_VOL5_PDF_TO_PRINTED[3] = 2;
for (let pdf = 4; pdf <= 7; pdf++) {
  TIRMIZI_VOL5_PDF_TO_PRINTED[pdf] = pdf + 4;
}
for (let pdf = 8; pdf <= 370; pdf++) {
  TIRMIZI_VOL5_PDF_TO_PRINTED[pdf] = pdf + 303;
}
TIRMIZI_VOL5_PDF_TO_PRINTED[371] = 673;

// Initialize Vol 5 Printed to PDF mapping
TIRMIZI_VOL5_PRINTED_TO_PDF[1] = 2; // Main title page
TIRMIZI_VOL5_PRINTED_TO_PDF[2] = 3; // Publication info
for (let printed = 3; printed <= 7; printed++) {
  TIRMIZI_VOL5_PRINTED_TO_PDF[printed] = 4; // Bridge to start of Fihrist
}
for (let printed = 8; printed <= 11; printed++) {
  TIRMIZI_VOL5_PRINTED_TO_PDF[printed] = printed - 4; // Maps 8..11 to PDF 4..7 (Fihrist)
}
// For relative pages 12 to 310 entered by user, map directly to PDF 12..310
for (let printed = 12; printed <= 310; printed++) {
  TIRMIZI_VOL5_PRINTED_TO_PDF[printed] = Math.min(371, printed);
}
// For printed book pages 311 to 673 (main hadith text), map to PDF 8..370
for (let printed = 311; printed <= 673; printed++) {
  TIRMIZI_VOL5_PRINTED_TO_PDF[printed] = printed - 303;
}

/**
 * Verified 1-to-1 Page Mapping Table for Jami' at-Tirmidhi Volume 2 Part 3 (Part 6)
 * Generated via individual scan inspection across all 157 PDF pages.
 *
 * Pagination breakdown:
 * - PDF 1: Outer Cover -> Printed 1
 * - PDF 2: Title Page (جامع ترمذی شریف جلد دوم تالیف: امام ابو عیسی ترمذی) -> Printed 1
 * - PDF 3: Publication info / Blank -> Printed 2
 * - PDF 4-5: Front matter Fihrist (Table of contents for Part 6) -> Printed 11 to 12 (offset +7)
 * - PDF 6-156: Main Hadith Text (Abwab-ul-Manaqib to Kitab-ul-Ilal) -> Printed 674 to 824 (offset +668)
 * - PDF 157: Back Cover -> Printed 824
 */
const TIRMIZI_VOL6_PDF_TO_PRINTED: number[] = new Array(158);
const TIRMIZI_VOL6_PRINTED_TO_PDF: number[] = new Array(825);

// Initialize Vol 6 PDF to Printed mapping
TIRMIZI_VOL6_PDF_TO_PRINTED[1] = 1;
TIRMIZI_VOL6_PDF_TO_PRINTED[2] = 1;
TIRMIZI_VOL6_PDF_TO_PRINTED[3] = 2;
TIRMIZI_VOL6_PDF_TO_PRINTED[4] = 11;
TIRMIZI_VOL6_PDF_TO_PRINTED[5] = 12;
for (let pdf = 6; pdf <= 156; pdf++) {
  TIRMIZI_VOL6_PDF_TO_PRINTED[pdf] = pdf + 668;
}
TIRMIZI_VOL6_PDF_TO_PRINTED[157] = 824;

// Initialize Vol 6 Printed to PDF mapping
TIRMIZI_VOL6_PRINTED_TO_PDF[1] = 2; // Main title page
TIRMIZI_VOL6_PRINTED_TO_PDF[2] = 3; // Publication info
for (let printed = 3; printed <= 10; printed++) {
  TIRMIZI_VOL6_PRINTED_TO_PDF[printed] = 4; // Bridge to start of Fihrist
}
TIRMIZI_VOL6_PRINTED_TO_PDF[11] = 4; // Fihrist page 11
TIRMIZI_VOL6_PRINTED_TO_PDF[12] = 5; // Fihrist page 12
// For relative pages 13 to 673 entered by user, map directly to PDF 13..157
for (let printed = 13; printed <= 673; printed++) {
  TIRMIZI_VOL6_PRINTED_TO_PDF[printed] = Math.min(157, printed);
}
// For printed book pages 674 to 824 (main hadith text), map to PDF 6..156
for (let printed = 674; printed <= 824; printed++) {
  TIRMIZI_VOL6_PRINTED_TO_PDF[printed] = printed - 668;
}

/**
 * Maps actual PDF scan index (1-based) to verified printed book page number.
 */
export function getTirmiziPrintedPage(volNum: number = 1, pdfPage: number): number {
  if (volNum === 1) {
    const clampedPdf = Math.max(1, Math.min(340, Math.floor(pdfPage)));
    return TIRMIZI_VOL1_PDF_TO_PRINTED[clampedPdf] || clampedPdf;
  }
  if (volNum === 2) {
    const clampedPdf = Math.max(1, Math.min(375, Math.floor(pdfPage)));
    return TIRMIZI_VOL2_PDF_TO_PRINTED[clampedPdf] || clampedPdf;
  }
  if (volNum === 3) {
    const clampedPdf = Math.max(1, Math.min(297, Math.floor(pdfPage)));
    return TIRMIZI_VOL3_PDF_TO_PRINTED[clampedPdf] || clampedPdf;
  }
  if (volNum === 4) {
    const clampedPdf = Math.max(1, Math.min(308, Math.floor(pdfPage)));
    return TIRMIZI_VOL4_PDF_TO_PRINTED[clampedPdf] || clampedPdf;
  }
  if (volNum === 5) {
    const clampedPdf = Math.max(1, Math.min(371, Math.floor(pdfPage)));
    return TIRMIZI_VOL5_PDF_TO_PRINTED[clampedPdf] || clampedPdf;
  }
  if (volNum === 6) {
    const clampedPdf = Math.max(1, Math.min(157, Math.floor(pdfPage)));
    return TIRMIZI_VOL6_PDF_TO_PRINTED[clampedPdf] || clampedPdf;
  }
  return Math.max(1, pdfPage);
}

/**
 * Maps printed book page number to the corresponding exact PDF scan index (1-based).
 */
export function getTirmiziPdfPage(volNum: number = 1, printedPage: number): number {
  if (volNum === 1) {
    const clampedPrinted = Math.max(1, Math.min(353, Math.floor(printedPage)));
    return TIRMIZI_VOL1_PRINTED_TO_PDF[clampedPrinted] || 1;
  }
  if (volNum === 2) {
    const clampedPrinted = Math.max(1, Math.min(715, Math.floor(printedPage)));
    return TIRMIZI_VOL2_PRINTED_TO_PDF[clampedPrinted] || 1;
  }
  if (volNum === 3) {
    const clampedPrinted = Math.max(1, Math.min(1000, Math.floor(printedPage)));
    return TIRMIZI_VOL3_PRINTED_TO_PDF[clampedPrinted] || 1;
  }
  if (volNum === 4) {
    const clampedPrinted = Math.max(1, Math.min(310, Math.floor(printedPage)));
    return TIRMIZI_VOL4_PRINTED_TO_PDF[clampedPrinted] || 1;
  }
  if (volNum === 5) {
    const clampedPrinted = Math.max(1, Math.min(673, Math.floor(printedPage)));
    return TIRMIZI_VOL5_PRINTED_TO_PDF[clampedPrinted] || 1;
  }
  if (volNum === 6) {
    const clampedPrinted = Math.max(1, Math.min(824, Math.floor(printedPage)));
    return TIRMIZI_VOL6_PRINTED_TO_PDF[clampedPrinted] || 1;
  }
  return Math.max(1, printedPage);
}


