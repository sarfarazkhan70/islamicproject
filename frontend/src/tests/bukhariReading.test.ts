import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  BUKHARI_VOLUMES,
  getBukhariVolume,
  GOOGLE_DRIVE_BUKHARI_LINK,
  GOOGLE_DRIVE_BUKHARI_FILE_ID,
  LOCAL_BUKHARI_PDF_PATH,
} from '../data/bukhariData';
import { BukhariService } from '../services/bukhariService';
import { BukhariPdfService } from '../services/bukhariPdfService';
import { ISLAMIC_BOOKS } from '../data/libraryData';

describe('Sahih al-Bukhari Google Drive Single Book Verification', () => {
  it('should have exactly 1 book item configured with the Google Drive link and 699 pages', () => {
    expect(BUKHARI_VOLUMES.length).toBe(1);
    const item = BUKHARI_VOLUMES[0];
    expect(item.id).toBe('bukhari-book-1');
    expect(item.title).toBe('Sahih al-Bukhari');
    expect(item.arabicTitle).toBe('صحيح البخاري');
    expect(item.totalPages).toBe(699);
    expect(item.googleDriveId).toBe('1E0hs0zZzKMET9J20kAzeIPR-Mdw51zBm');
    expect(item.googleDriveLink).toBe(GOOGLE_DRIVE_BUKHARI_LINK);
  });

  it('should have local PDF served at /pdf/bukhari_shareef_drive.pdf', () => {
    expect(LOCAL_BUKHARI_PDF_PATH).toBe('/pdf/bukhari_shareef_drive.pdf');
    const localFilePath = path.resolve(__dirname, '../../public/pdf/bukhari_shareef_drive.pdf');
    expect(fs.existsSync(localFilePath)).toBe(true);
    const stats = fs.statSync(localFilePath);
    expect(stats.size).toBeGreaterThan(40_000_000); // 43.6 MB
  });

  it('should have clean single-item definition in ISLAMIC_BOOKS', () => {
    const bukhariBook = ISLAMIC_BOOKS.find((b) => b.id === 'sahih-al-bukhari');
    expect(bukhariBook).toBeDefined();
    expect(bukhariBook?.volumeCount).toBe(1);
    expect(bukhariBook?.volumes?.length).toBe(1);
    expect(bukhariBook?.author).toBe('Imam Muhammad ibn Ismail al-Bukhari');
  });

  it('should resolve Google Drive preview URL and local PDF via BukhariService', () => {
    expect(BukhariService.getGoogleDriveUrl()).toBe(GOOGLE_DRIVE_BUKHARI_LINK);
    expect(BukhariService.getGoogleDrivePreviewUrl()).toContain(GOOGLE_DRIVE_BUKHARI_FILE_ID);
    expect(BukhariService.getGoogleDrivePreviewUrl(350)).toContain('#page=350');
    expect(BukhariService.getLocalPdfUrl()).toBe('/pdf/bukhari_shareef_drive.pdf');
  });

  it('should correctly resolve volume using getBukhariVolume', () => {
    const vol = getBukhariVolume(1);
    expect(vol).toBeDefined();
    expect(vol.id).toBe('bukhari-book-1');
    expect(vol.totalPages).toBe(699);
  });

  it('should have BukhariPdfService exposing getDocument and renderPageToCanvas', () => {
    expect(typeof BukhariPdfService.getDocument).toBe('function');
    expect(typeof BukhariPdfService.renderPageToCanvas).toBe('function');
  });

  it('should verify BukhariReader component has pure vertical scroll layout with no Next/Previous buttons', () => {
    const readerFilePath = path.resolve(__dirname, '../components/library/BukhariReader.tsx');
    expect(fs.existsSync(readerFilePath)).toBe(true);
    const code = fs.readFileSync(readerFilePath, 'utf8');

    // Verify complete removal of Previous Page and Next Page buttons
    expect(code).not.toContain('Previous Page');
    expect(code).not.toContain('Next Page');
    expect(code).not.toContain('الصفحة السابقة');
    expect(code).not.toContain('الصفحة التالية');
    expect(code).not.toContain('Jump back 10');
    expect(code).not.toContain('Jump forward 10');

    // Verify vertical reading stream and page card structure
    expect(code).toContain('bukhari-vertical-reading-stream');
    expect(code).toContain('bukhari-page-card');
    expect(code).toContain('scrollSnapType');
    expect(code).toContain('scrollSnapAlign');
    expect(code).toContain('bukhari-page-');

    // Verify size presets and page search
    expect(code).toContain('125%');
    expect(code).toContain('150%');
    expect(code).toContain('175%');
    expect(code).toContain('200%');
    expect(code).toContain('Fit Width');
    expect(code).toContain('totalPages');
  });
});
