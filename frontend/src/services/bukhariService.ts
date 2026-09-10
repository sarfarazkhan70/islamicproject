// ============================================================================
// SAHIH AL-BUKHARI SERVICE: Google Drive Single Book Service
// ============================================================================

import {
  getBukhariVolume,
  GOOGLE_DRIVE_BUKHARI_LINK,
  GOOGLE_DRIVE_BUKHARI_FILE_ID,
  LOCAL_BUKHARI_PDF_PATH,
} from '../data/bukhariData';

export class BukhariService {
  public static getBookInfo() {
    return getBukhariVolume(1);
  }

  public static getGoogleDriveUrl(): string {
    return GOOGLE_DRIVE_BUKHARI_LINK;
  }

  public static getGoogleDrivePreviewUrl(pageNumber?: number): string {
    const base = `https://drive.google.com/file/d/${GOOGLE_DRIVE_BUKHARI_FILE_ID}/preview`;
    return pageNumber ? `${base}#page=${pageNumber}` : base;
  }

  public static getLocalPdfUrl(): string {
    return LOCAL_BUKHARI_PDF_PATH;
  }
}



