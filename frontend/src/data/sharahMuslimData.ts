// ============================================================================
// SHARH SAHIH MUSLIM: AUTHENTIC VOLUME METADATA & LOCAL PDF CONFIGURATION
// تأليف: العلامة غلام رسول السعيدي (شيخ الحديث دار العلوم نعيمية كراتشي)
// ============================================================================

export interface SharahMuslimVolumeMeta {
  volumeNumber: number;
  id: string;
  title: string;
  arabicTitle: string;
  urduTitle: string;
  author: string;
  authorUrdu: string;
  totalPages: number; // Total PDF scans
  totalPrintedPages: number; // Authentic printed book pages
  localPdfUrl: string;
  isAvailable: boolean;
}

export const LOCAL_SHARAH_MUSLIM_VOL1_PDF_PATH = '/pdf/sharah_sahih_muslim_vol1.pdf';
export const LOCAL_SHARAH_MUSLIM_VOL2_PDF_PATH = '/pdf/sharah_sahih_muslim_vol2.pdf';
export const LOCAL_SHARAH_MUSLIM_VOL3_PDF_PATH = '/pdf/sharah_sahih_muslim_vol3.pdf';
export const LOCAL_SHARAH_MUSLIM_VOL4_PDF_PATH = '/pdf/sharah_sahih_muslim_vol4.pdf';
export const LOCAL_SHARAH_MUSLIM_VOL5_PDF_PATH = '/pdf/sharah_sahih_muslim_vol5.pdf';
export const LOCAL_SHARAH_MUSLIM_VOL6_PDF_PATH = '/pdf/sharah_sahih_muslim_vol6.pdf';
export const LOCAL_SHARAH_MUSLIM_VOL7_PDF_PATH = '/pdf/sharah_sahih_muslim_vol7.pdf';

export const SHARAH_MUSLIM_VOLUMES: SharahMuslimVolumeMeta[] = [
  {
    volumeNumber: 1,
    id: 'sharah-muslim-vol-1',
    title: 'Sharh Sahih Muslim — Jild 1',
    arabicTitle: 'شرح صحيح مسلم — المجلد الأول',
    urduTitle: 'شرح صحیح مسلم — جلد ۱',
    author: 'Allama Ghulam Rasool Saeedi',
    authorUrdu: 'علامہ غلام رسول سعیدی',
    totalPages: 1339,
    totalPrintedPages: 1338,
    localPdfUrl: LOCAL_SHARAH_MUSLIM_VOL1_PDF_PATH,
    isAvailable: true,
  },
  {
    volumeNumber: 2,
    id: 'sharah-muslim-vol-2',
    title: 'Sharh Sahih Muslim — Jild 2',
    arabicTitle: 'شرح صحيح مسلم — المجلد الثاني',
    urduTitle: 'شرح صحیح مسلم — جلد ۲',
    author: 'Allama Ghulam Rasool Saeedi',
    authorUrdu: 'علامہ غلام رسول سعیدی',
    totalPages: 1037,
    totalPrintedPages: 1040,
    localPdfUrl: LOCAL_SHARAH_MUSLIM_VOL2_PDF_PATH,
    isAvailable: true,
  },
  {
    volumeNumber: 3,
    id: 'sharah-muslim-vol-3',
    title: 'Sharh Sahih Muslim — Jild 3',
    arabicTitle: 'شرح صحيح مسلم — المجلد الثالث',
    urduTitle: 'شرح صحیح مسلم — جلد ۳',
    author: 'Allama Ghulam Rasool Saeedi',
    authorUrdu: 'علامہ غلام رسول سعیدی',
    totalPages: 1194,
    totalPrintedPages: 1194,
    localPdfUrl: LOCAL_SHARAH_MUSLIM_VOL3_PDF_PATH,
    isAvailable: true,
  },
  {
    volumeNumber: 4,
    id: 'sharah-muslim-vol-4',
    title: 'Sharh Sahih Muslim — Jild 4',
    arabicTitle: 'شرح صحيح مسلم — المجلد الرابع',
    urduTitle: 'شرح صحیح مسلم — جلد ۴',
    author: 'Allama Ghulam Rasool Saeedi',
    authorUrdu: 'علامہ غلام رسول سعیدی',
    totalPages: 911,
    totalPrintedPages: 910,
    localPdfUrl: LOCAL_SHARAH_MUSLIM_VOL4_PDF_PATH,
    isAvailable: true,
  },
  {
    volumeNumber: 5,
    id: 'sharah-muslim-vol-5',
    title: 'Sharh Sahih Muslim — Jild 5',
    arabicTitle: 'شرح صحيح مسلم — المجلد الخامس',
    urduTitle: 'شرح صحیح مسلم — جلد ۵',
    author: 'Allama Ghulam Rasool Saeedi',
    authorUrdu: 'علامہ غلام رسول سعیدی',
    totalPages: 982,
    totalPrintedPages: 981,
    localPdfUrl: LOCAL_SHARAH_MUSLIM_VOL5_PDF_PATH,
    isAvailable: true,
  },
  {
    volumeNumber: 6,
    id: 'sharah-muslim-vol-6',
    title: 'Sharh Sahih Muslim — Jild 6',
    arabicTitle: 'شرح صحيح مسلم — المجلد السادس',
    urduTitle: 'شرح صحیح مسلم — جلد ۶',
    author: 'Allama Ghulam Rasool Saeedi',
    authorUrdu: 'علامہ غلام رسول سعیدی',
    totalPages: 1262,
    totalPrintedPages: 1262,
    localPdfUrl: LOCAL_SHARAH_MUSLIM_VOL6_PDF_PATH,
    isAvailable: true,
  },
  {
    volumeNumber: 7,
    id: 'sharah-muslim-vol-7',
    title: 'Sharh Sahih Muslim — Jild 7',
    arabicTitle: 'شرح صحيح مسلم — المجلد السابع',
    urduTitle: 'شرح صحیح مسلم — جلد ۷',
    author: 'Allama Ghulam Rasool Saeedi',
    authorUrdu: 'علامہ غلام رسول سعیدی',
    totalPages: 1103,
    totalPrintedPages: 1102,
    localPdfUrl: LOCAL_SHARAH_MUSLIM_VOL7_PDF_PATH,
    isAvailable: true,
  },
];

export function getSharahMuslimVolume(volNum: number = 1): SharahMuslimVolumeMeta {
  return SHARAH_MUSLIM_VOLUMES.find((v) => v.volumeNumber === volNum) || SHARAH_MUSLIM_VOLUMES[0];
}

/**
 * Maps actual PDF scan index (1-based) to printed book page number.
 */
export function getSharahMuslimPrintedPage(volNum: number, pdfPage: number): number {
  if (volNum === 1) {
    if (pdfPage <= 3) return 1;
    if (pdfPage === 4) return 2;
    if (pdfPage === 5) return 3;
    if (pdfPage >= 6 && pdfPage <= 1339) return pdfPage - 1; // PDF 6 to 1339 -> Printed 5 to 1338
    return 1338;
  }
  if (volNum === 2) {
    if (pdfPage <= 2) return 1;
    if (pdfPage >= 3 && pdfPage <= 30) return pdfPage - 1; // PDF 3 to 30 -> Printed 2 to 29
    if (pdfPage >= 31 && pdfPage <= 548) return pdfPage + 1; // PDF 31 to 548 -> Printed 32 to 549
    if (pdfPage >= 549 && pdfPage <= 1037) return pdfPage + 3; // PDF 549 to 1037 -> Printed 552 to 1040
    return 1040;
  }
  if (volNum === 3) {
    return Math.max(1, Math.min(1194, pdfPage));
  }
  if (volNum === 4) {
    if (pdfPage <= 2) return 1;
    if (pdfPage >= 3 && pdfPage <= 911) return pdfPage - 1; // PDF 3 to 911 -> Printed 2 to 910
    return 910;
  }
  if (volNum === 5) {
    if (pdfPage <= 2) return 1;
    if (pdfPage >= 3 && pdfPage <= 982) return pdfPage - 1; // PDF 3 to 982 -> Printed 2 to 981
    return 981;
  }
  if (volNum === 6) {
    return Math.max(1, Math.min(1262, pdfPage));
  }
  if (volNum === 7) {
    if (pdfPage <= 2) return 1;
    if (pdfPage >= 3 && pdfPage <= 1103) return pdfPage - 1; // PDF 3 to 1103 -> Printed 2 to 1102
    return 1102;
  }
  return Math.max(1, pdfPage);
}

/**
 * Maps printed book page number to the corresponding PDF scan index (1-based).
 */
export function getSharahMuslimPdfPage(volNum: number, printedPage: number): number {
  if (volNum === 1) {
    if (printedPage <= 1) return 1;
    if (printedPage === 2) return 4;
    if (printedPage === 3) return 5;
    if (printedPage === 4) return 5; // Printed 4 was blank; maps to start of index / PDF 5
    if (printedPage >= 5 && printedPage <= 1338) return printedPage + 1; // Printed 5 to 1338 -> PDF 6 to 1339
    return 1339;
  }
  if (volNum === 2) {
    if (printedPage <= 1) return 1;
    if (printedPage >= 2 && printedPage <= 29) return printedPage + 1; // Printed 2 to 29 -> PDF 3 to 30
    if (printedPage === 30 || printedPage === 31) return 31; // Printed 30-31 omitted in print; maps to start of body / PDF 31
    if (printedPage >= 32 && printedPage <= 549) return printedPage - 1; // Printed 32 to 549 -> PDF 31 to 548
    if (printedPage === 550 || printedPage === 551) return 549; // Printed 550-551 omitted in print; maps to start of section / PDF 549
    if (printedPage >= 552 && printedPage <= 1040) return printedPage - 3; // Printed 552 to 1040 -> PDF 549 to 1037
    return 1037;
  }
  if (volNum === 3) {
    return Math.max(1, Math.min(1194, printedPage));
  }
  if (volNum === 4) {
    if (printedPage <= 1) return 1;
    if (printedPage >= 2 && printedPage <= 910) return printedPage + 1; // Printed 2 to 910 -> PDF 3 to 911
    return 911;
  }
  if (volNum === 5) {
    if (printedPage <= 1) return 1;
    if (printedPage >= 2 && printedPage <= 981) return printedPage + 1; // Printed 2 to 981 -> PDF 3 to 982
    return 982;
  }
  if (volNum === 6) {
    return Math.max(1, Math.min(1262, printedPage));
  }
  if (volNum === 7) {
    if (printedPage <= 1) return 1;
    if (printedPage >= 2 && printedPage <= 1102) return printedPage + 1; // Printed 2 to 1102 -> PDF 3 to 1103
    return 1103;
  }
  return Math.max(1, printedPage);
}
