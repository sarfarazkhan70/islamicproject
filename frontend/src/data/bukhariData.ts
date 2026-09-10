// ============================================================================
// SAHIH AL-BUKHARI: GOOGLE DRIVE EDITION (SINGLE BOOK)
// للإمام الحافظ أبي عبد الله محمد بن إسماعيل البخاري رحمه الله (۱۹۴ - ۲۵۶ هـ)
// Google Drive: https://drive.google.com/file/d/1E0hs0zZzKMET9J20kAzeIPR-Mdw51zBm/view?usp=drivesdk
// ============================================================================

export interface BukhariVolumeMeta {
  volumeNumber: number;
  id: string;
  title: string;
  arabicTitle: string;
  urduTitle: string;
  totalPages: number;
  googleDriveId: string;
  googleDriveLink: string;
  googleDrivePreviewUrl: string;
  localPdfUrl: string;
}

export const GOOGLE_DRIVE_BUKHARI_LINK =
  'https://drive.google.com/file/d/1E0hs0zZzKMET9J20kAzeIPR-Mdw51zBm/view?usp=drivesdk';
export const GOOGLE_DRIVE_BUKHARI_FILE_ID = '1E0hs0zZzKMET9J20kAzeIPR-Mdw51zBm';
export const LOCAL_BUKHARI_PDF_PATH = '/pdf/bukhari_shareef_drive.pdf';

export const BUKHARI_VOLUMES: BukhariVolumeMeta[] = [
  {
    volumeNumber: 1,
    id: 'bukhari-book-1',
    title: 'Sahih al-Bukhari',
    arabicTitle: 'صحيح البخاري',
    urduTitle: 'صحیح البخاری',
    totalPages: 699,
    googleDriveId: GOOGLE_DRIVE_BUKHARI_FILE_ID,
    googleDriveLink: GOOGLE_DRIVE_BUKHARI_LINK,
    googleDrivePreviewUrl: `https://drive.google.com/file/d/${GOOGLE_DRIVE_BUKHARI_FILE_ID}/preview`,
    localPdfUrl: LOCAL_BUKHARI_PDF_PATH,
  },
];

export function getBukhariVolume(_volNum?: number): BukhariVolumeMeta {
  return BUKHARI_VOLUMES[0];
}


