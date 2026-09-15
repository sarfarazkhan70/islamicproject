// ============================================================================
// SAHIH MUSLIM: AUTHENTIC VOLUME METADATA & LOCAL PDF CONFIGURATION
// للإمام الحافظ أبي الحسين مسلم بن الحجاج القشيري النيسابوري (۲۰۴ - ۲۶۱ هـ)
// ============================================================================

export interface MuslimVolumeMeta {
  volumeNumber: number;
  id: string;
  title: string;
  arabicTitle: string;
  urduTitle: string;
  totalPages: number;
  totalPrintedPages: number;
  localPdfUrl: string;
}

export const LOCAL_MUSLIM_VOL1_PDF_PATH = '/pdf/sahih_muslim_vol1.pdf';
export const LOCAL_MUSLIM_VOL2_PDF_PATH = '/pdf/sahih_muslim_vol2.pdf';
export const LOCAL_MUSLIM_VOL3_PDF_PATH = '/pdf/sahih_muslim_vol3.pdf';
export const LOCAL_MUSLIM_VOL4_PDF_PATH = '/pdf/sahih_muslim_vol4.pdf';
export const LOCAL_MUSLIM_VOL5_PDF_PATH = '/pdf/sahih_muslim_vol5.pdf';
export const LOCAL_MUSLIM_VOL6_PDF_PATH = '/pdf/sahih_muslim_vol6.pdf';

export const MUSLIM_VOLUMES: MuslimVolumeMeta[] = [
  {
    volumeNumber: 1,
    id: 'muslim-vol-1',
    title: 'Sahih Muslim — Jild 1',
    arabicTitle: 'صحيح مسلم — المجلد الأول',
    urduTitle: 'صحیح مسلم — جلد ۱',
    totalPages: 453,
    totalPrintedPages: 453,
    localPdfUrl: LOCAL_MUSLIM_VOL1_PDF_PATH,
  },
  {
    volumeNumber: 2,
    id: 'muslim-vol-2',
    title: 'Sahih Muslim — Jild 2',
    arabicTitle: 'صحيح مسلم — المجلد الثاني',
    urduTitle: 'صحیح مسلم — جلد ۲',
    totalPages: 425,
    totalPrintedPages: 419,
    localPdfUrl: LOCAL_MUSLIM_VOL2_PDF_PATH,
  },
  {
    volumeNumber: 3,
    id: 'muslim-vol-3',
    title: 'Sahih Muslim — Jild 3',
    arabicTitle: 'صحيح مسلم — المجلد الثالث',
    urduTitle: 'صحیح مسلم — جلد ۳',
    totalPages: 397,
    totalPrintedPages: 396,
    localPdfUrl: LOCAL_MUSLIM_VOL3_PDF_PATH,
  },
  {
    volumeNumber: 4,
    id: 'muslim-vol-4',
    title: 'Sahih Muslim — Jild 4',
    arabicTitle: 'صحيح مسلم — المجلد الرابع',
    urduTitle: 'صحیح مسلم — جلد ۴',
    totalPages: 354,
    totalPrintedPages: 352,
    localPdfUrl: LOCAL_MUSLIM_VOL4_PDF_PATH,
  },
  {
    volumeNumber: 5,
    id: 'muslim-vol-5',
    title: 'Sahih Muslim — Jild 5',
    arabicTitle: 'صحيح مسلم — المجلد الخامس',
    urduTitle: 'صحیح مسلم — جلد ۵',
    totalPages: 408,
    totalPrintedPages: 408,
    localPdfUrl: LOCAL_MUSLIM_VOL5_PDF_PATH,
  },
  {
    volumeNumber: 6,
    id: 'muslim-vol-6',
    title: 'Sahih Muslim — Jild 6',
    arabicTitle: 'صحيح مسلم — المجلد السادس',
    urduTitle: 'صحیح مسلم — جلد ۶',
    totalPages: 520,
    totalPrintedPages: 518,
    localPdfUrl: LOCAL_MUSLIM_VOL6_PDF_PATH,
  },
];

export function getMuslimVolume(volNum: number = 1): MuslimVolumeMeta {
  return MUSLIM_VOLUMES.find((v) => v.volumeNumber === volNum) || MUSLIM_VOLUMES[0];
}

/**
 * Maps actual PDF scan index (1-based) to printed book page number.
 */
export function getMuslimPrintedPage(volNum: number, pdfPage: number): number {
  if (volNum === 1) {
    return Math.max(1, Math.min(453, pdfPage));
  }
  if (volNum === 2) {
    if (pdfPage <= 5) return Math.max(1, pdfPage);
    if (pdfPage >= 6 && pdfPage <= 30) return pdfPage - 1; // 5 to 29
    if (pdfPage === 31) return 29;
    if (pdfPage >= 32 && pdfPage <= 40) return pdfPage - 2; // 30 to 38
    if (pdfPage === 41 || pdfPage === 42) return 39;
    if (pdfPage >= 43 && pdfPage <= 45) return pdfPage - 3; // 40 to 42
    if (pdfPage === 46) return 42;
    if (pdfPage >= 47 && pdfPage <= 423) return pdfPage - 4; // 43 to 419
    return 419;
  }
  if (volNum === 3) {
    if (pdfPage <= 11) return Math.max(1, pdfPage);
    if (pdfPage === 12) return 11;
    if (pdfPage >= 13 && pdfPage <= 396) return pdfPage;
    return 396;
  }
  if (volNum === 4) {
    return Math.max(1, Math.min(352, pdfPage));
  }
  if (volNum === 5) {
    if (pdfPage <= 183) return Math.max(1, pdfPage);
    if (pdfPage >= 184 && pdfPage <= 407) return pdfPage + 1; // PDF 184 to 407 -> Printed 185 to 408
    return 408;
  }
  if (volNum === 6) {
    return Math.max(1, Math.min(518, pdfPage));
  }
  return Math.max(1, pdfPage);
}

/**
 * Maps printed book page number to the corresponding PDF scan index (1-based).
 */
export function getMuslimPdfPage(volNum: number, printedPage: number): number {
  if (volNum === 1) {
    return Math.max(1, Math.min(453, printedPage));
  }
  if (volNum === 2) {
    if (printedPage <= 4) return Math.max(1, printedPage);
    if (printedPage >= 5 && printedPage <= 29) return printedPage + 1; // PDF 6 to 30
    if (printedPage >= 30 && printedPage <= 38) return printedPage + 2; // PDF 32 to 40
    if (printedPage === 39) return 41; // PDF 41
    if (printedPage >= 40 && printedPage <= 42) return printedPage + 3; // PDF 43 to 45
    if (printedPage >= 43 && printedPage <= 419) return printedPage + 4; // PDF 47 to 423
    return 423;
  }
  if (volNum === 3) {
    if (printedPage <= 11) return Math.max(1, printedPage);
    if (printedPage >= 12 && printedPage <= 396) return printedPage;
    return 396;
  }
  if (volNum === 4) {
    return Math.max(1, Math.min(352, printedPage));
  }
  if (volNum === 5) {
    if (printedPage <= 183) return Math.max(1, printedPage);
    if (printedPage === 184) return 184; // Printed 184 skipped in print; maps to PDF 184 (Kitab as-Sayd start)
    if (printedPage >= 185 && printedPage <= 408) return printedPage - 1; // Printed 185 to 408 -> PDF 184 to 407
    return 407;
  }
  if (volNum === 6) {
    return Math.max(1, Math.min(518, printedPage));
  }
  return Math.max(1, printedPage);
}


