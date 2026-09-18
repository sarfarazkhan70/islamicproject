// ============================================================================
// SAHIH AL-BUKHARI: AUTHENTIC MULTI-VOLUME COLLECTION
// للإمام الحافظ أبي عبد الله محمد بن إسماعيل البخاري رحمه الله (۱۹۴ - ۲۵۶ هـ)
// ============================================================================

export interface BukhariVolumeMeta {
  volumeNumber: number;
  id: string;
  title: string;
  displayTitle: string;
  arabicTitle: string;
  urduTitle: string;
  author: string;
  totalPages: number; // Total PDF Pages (including outer cover)
  totalPrintedPages: number; // Total Printed Book Pages
  googleDriveId: string;
  googleDriveLink: string;
  googleDrivePreviewUrl: string;
  localPdfUrl: string;
}

export const GOOGLE_DRIVE_BUKHARI_VOL1_LINK =
  'https://drive.google.com/file/d/1E0hs0zZzKMET9J20kAzeIPR-Mdw51zBm/view?usp=drivesdk';
export const GOOGLE_DRIVE_BUKHARI_VOL1_FILE_ID = '1E0hs0zZzKMET9J20kAzeIPR-Mdw51zBm';
export const LOCAL_BUKHARI_VOL1_PDF_PATH = '/pdf/bukhari_shareef_drive.pdf';

export const GOOGLE_DRIVE_BUKHARI_VOL2_LINK =
  'https://drive.google.com/file/d/1S1oweMG_zebXqLDrd1I4zCAjRhgnx73N/view?usp=drivesdk';
export const GOOGLE_DRIVE_BUKHARI_VOL2_FILE_ID = '1S1oweMG_zebXqLDrd1I4zCAjRhgnx73N';
export const LOCAL_BUKHARI_VOL2_PDF_PATH = '/pdf/bukhari_shareef_vol_2.pdf';

// Backward compatibility constants
export const GOOGLE_DRIVE_BUKHARI_LINK = GOOGLE_DRIVE_BUKHARI_VOL1_LINK;
export const GOOGLE_DRIVE_BUKHARI_FILE_ID = GOOGLE_DRIVE_BUKHARI_VOL1_FILE_ID;
export const LOCAL_BUKHARI_PDF_PATH = LOCAL_BUKHARI_VOL1_PDF_PATH;

export const BUKHARI_VOLUMES: BukhariVolumeMeta[] = [
  {
    volumeNumber: 1,
    id: 'bukhari-book-1',
    title: 'Sahih al-Bukhari',
    displayTitle: 'Jild 1',
    arabicTitle: 'صحيح البخاري - المجلد الأول',
    urduTitle: 'صحیح البخاری - جلد 1',
    author: 'Imam Muhammad Ismail Bukhari',
    totalPages: 699,
    totalPrintedPages: 698,
    googleDriveId: GOOGLE_DRIVE_BUKHARI_VOL1_FILE_ID,
    googleDriveLink: GOOGLE_DRIVE_BUKHARI_VOL1_LINK,
    googleDrivePreviewUrl: `https://drive.google.com/file/d/${GOOGLE_DRIVE_BUKHARI_VOL1_FILE_ID}/preview`,
    localPdfUrl: LOCAL_BUKHARI_VOL1_PDF_PATH,
  },
  {
    volumeNumber: 2,
    id: 'bukhari-book-2',
    title: 'Sahih al-Bukhari',
    displayTitle: 'Jild 2',
    arabicTitle: 'صحيح البخاري - المجلد الثاني',
    urduTitle: 'صحیح البخاری - جلد 2',
    author: 'Imam Muhammad Ismail Bukhari',
    totalPages: 691,
    totalPrintedPages: 690,
    googleDriveId: GOOGLE_DRIVE_BUKHARI_VOL2_FILE_ID,
    googleDriveLink: GOOGLE_DRIVE_BUKHARI_VOL2_LINK,
    googleDrivePreviewUrl: `https://drive.google.com/file/d/${GOOGLE_DRIVE_BUKHARI_VOL2_FILE_ID}/preview`,
    localPdfUrl: LOCAL_BUKHARI_VOL2_PDF_PATH,
  },
];

export function getBukhariVolume(volNum: number = 1): BukhariVolumeMeta {
  const found = BUKHARI_VOLUMES.find((v) => v.volumeNumber === volNum);
  return found || BUKHARI_VOLUMES[0];
}

/**
 * Maps a printed page number (1..N) to the internal PDF page index (1..totalPages).
 * PDF Page 1 is the outer cover, so Printed Page 1 is PDF Page 2, Printed Page 50 is PDF Page 51, etc.
 */
export function bukhariPrintedToPdfPage(printedPage: number, volumeNumber: number = 1): number {
  const vol = getBukhariVolume(volumeNumber);
  const maxPrinted = vol.totalPrintedPages || vol.totalPages - 1;
  const clampedPrinted = Math.max(1, Math.min(maxPrinted, Math.floor(printedPage || 1)));
  return Math.min(vol.totalPages, clampedPrinted + 1);
}

/**
 * Maps an internal PDF page index (1..totalPages) to the actual printed page number (1..totalPrintedPages).
 */
export function bukhariPdfToPrintedPage(pdfPage: number, volumeNumber: number = 1): number {
  const vol = getBukhariVolume(volumeNumber);
  const maxPrinted = vol.totalPrintedPages || vol.totalPages - 1;
  if (pdfPage <= 1) return 1;
  return Math.max(1, Math.min(maxPrinted, pdfPage - 1));
}
