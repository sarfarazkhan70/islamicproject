import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  SHARAH_MUSLIM_VOLUMES,
  getSharahMuslimVolume,
  LOCAL_SHARAH_MUSLIM_VOL1_PDF_PATH,
  LOCAL_SHARAH_MUSLIM_VOL2_PDF_PATH,
  LOCAL_SHARAH_MUSLIM_VOL3_PDF_PATH,
  LOCAL_SHARAH_MUSLIM_VOL4_PDF_PATH,
  LOCAL_SHARAH_MUSLIM_VOL5_PDF_PATH,
  LOCAL_SHARAH_MUSLIM_VOL6_PDF_PATH,
  LOCAL_SHARAH_MUSLIM_VOL7_PDF_PATH,
  getSharahMuslimPrintedPage,
  getSharahMuslimPdfPage,
} from '../data/sharahMuslimData';
import { SharahMuslimPdfService } from '../services/sharahMuslimPdfService';
import { ISLAMIC_BOOKS, getBookById } from '../data/libraryData';

describe('Sharh Sahih Muslim (Allama Ghulam Rasool Saeedi) Verification', () => {
  it('should have Sharh Sahih Muslim configured with all 7 volumes active', () => {
    expect(SHARAH_MUSLIM_VOLUMES.length).toBe(7);

    const expectedMeta = [
      { volNum: 1, totalPages: 1339, totalPrintedPages: 1338 },
      { volNum: 2, totalPages: 1037, totalPrintedPages: 1040 },
      { volNum: 3, totalPages: 1194, totalPrintedPages: 1194 },
      { volNum: 4, totalPages: 911, totalPrintedPages: 910 },
      { volNum: 5, totalPages: 982, totalPrintedPages: 981 },
      { volNum: 6, totalPages: 1262, totalPrintedPages: 1262 },
      { volNum: 7, totalPages: 1103, totalPrintedPages: 1102 },
    ];

    for (const exp of expectedMeta) {
      const vol = SHARAH_MUSLIM_VOLUMES[exp.volNum - 1];
      expect(vol.id).toBe(`sharah-muslim-vol-${exp.volNum}`);
      expect(vol.volumeNumber).toBe(exp.volNum);
      expect(vol.title).toContain(`Jild ${exp.volNum}`);
      expect(vol.author).toContain('Allama Ghulam Rasool Saeedi');
      expect(vol.totalPages).toBe(exp.totalPages);
      expect(vol.totalPrintedPages).toBe(exp.totalPrintedPages);
      expect(vol.isAvailable).toBe(true);
    }
  });

  it('should have authentic complete Urdu PDFs served locally for all volumes', () => {
    const pdfPaths = [
      LOCAL_SHARAH_MUSLIM_VOL1_PDF_PATH,
      LOCAL_SHARAH_MUSLIM_VOL2_PDF_PATH,
      LOCAL_SHARAH_MUSLIM_VOL3_PDF_PATH,
      LOCAL_SHARAH_MUSLIM_VOL4_PDF_PATH,
      LOCAL_SHARAH_MUSLIM_VOL5_PDF_PATH,
      LOCAL_SHARAH_MUSLIM_VOL6_PDF_PATH,
      LOCAL_SHARAH_MUSLIM_VOL7_PDF_PATH,
    ];

    for (let i = 0; i < pdfPaths.length; i++) {
      const volNum = i + 1;
      const relPath = pdfPaths[i];
      expect(relPath).toBe(`/pdf/sharah_sahih_muslim_vol${volNum}.pdf`);
      const localFilePath = path.resolve(__dirname, `../../public${relPath}`);
      expect(fs.existsSync(localFilePath)).toBe(true);
      expect(fs.statSync(localFilePath).size).toBeGreaterThan(70_000_000); // All > 70MB
    }
  });

  it('should verify WebP pages are generated locally in frontend/public/sharah-muslim/ for Jild 1 to 5', () => {
    for (let v = 1; v <= 5; v++) {
      const pagesDir = path.resolve(__dirname, `../../public/sharah-muslim/jild-${v}`);
      expect(fs.existsSync(pagesDir)).toBe(true);
      expect(fs.existsSync(path.join(pagesDir, 'page_1.webp'))).toBe(true);
      expect(fs.existsSync(path.join(pagesDir, 'page_50.webp'))).toBe(true);
    }
  });

  it('should correctly resolve volumes using getSharahMuslimVolume for all 7 volumes', () => {
    for (let v = 1; v <= 7; v++) {
      const vol = getSharahMuslimVolume(v);
      expect(vol.volumeNumber).toBe(v);
      expect(vol.title).toContain(`Jild ${v}`);
      expect(vol.isAvailable).toBe(true);
    }
  });

  it('should verify exact printed page number mapping for Sharh Sahih Muslim Vol 1', () => {
    expect(getSharahMuslimPrintedPage(1, 1)).toBe(1);
    expect(getSharahMuslimPrintedPage(1, 2)).toBe(1);
    expect(getSharahMuslimPrintedPage(1, 3)).toBe(1);
    expect(getSharahMuslimPrintedPage(1, 4)).toBe(2);
    expect(getSharahMuslimPdfPage(1, 2)).toBe(4);
    expect(getSharahMuslimPrintedPage(1, 5)).toBe(3);
    expect(getSharahMuslimPdfPage(1, 3)).toBe(5);
    expect(getSharahMuslimPrintedPage(1, 6)).toBe(5);
    expect(getSharahMuslimPdfPage(1, 5)).toBe(6);
    expect(getSharahMuslimPrintedPage(1, 100)).toBe(99);
    expect(getSharahMuslimPdfPage(1, 99)).toBe(100);
    expect(getSharahMuslimPrintedPage(1, 1339)).toBe(1338);
    expect(getSharahMuslimPdfPage(1, 1338)).toBe(1339);
  });

  it('should verify exact printed page number mapping for Sharh Sahih Muslim Vol 2', () => {
    expect(getSharahMuslimPrintedPage(2, 1)).toBe(1);
    expect(getSharahMuslimPrintedPage(2, 2)).toBe(1);
    expect(getSharahMuslimPdfPage(2, 1)).toBe(1);
    expect(getSharahMuslimPrintedPage(2, 3)).toBe(2);
    expect(getSharahMuslimPdfPage(2, 2)).toBe(3);
    expect(getSharahMuslimPrintedPage(2, 31)).toBe(32);
    expect(getSharahMuslimPdfPage(2, 32)).toBe(31);
    expect(getSharahMuslimPrintedPage(2, 399)).toBe(400);
    expect(getSharahMuslimPdfPage(2, 400)).toBe(399);
    expect(getSharahMuslimPrintedPage(2, 549)).toBe(552);
    expect(getSharahMuslimPdfPage(2, 552)).toBe(549);
    expect(getSharahMuslimPrintedPage(2, 1037)).toBe(1040);
    expect(getSharahMuslimPdfPage(2, 1040)).toBe(1037);
  });

  it('should verify exact printed page number mapping for Sharh Sahih Muslim Vol 3 and 4', () => {
    // Vol 3: 1-to-1
    expect(getSharahMuslimPrintedPage(3, 1)).toBe(1);
    expect(getSharahMuslimPrintedPage(3, 100)).toBe(100);
    expect(getSharahMuslimPrintedPage(3, 1194)).toBe(1194);

    // Vol 4: scan - 1
    expect(getSharahMuslimPrintedPage(4, 1)).toBe(1);
    expect(getSharahMuslimPrintedPage(4, 3)).toBe(2);
    expect(getSharahMuslimPdfPage(4, 2)).toBe(3);
    expect(getSharahMuslimPrintedPage(4, 100)).toBe(99);
    expect(getSharahMuslimPdfPage(4, 99)).toBe(100);
    expect(getSharahMuslimPrintedPage(4, 911)).toBe(910);
    expect(getSharahMuslimPdfPage(4, 910)).toBe(911);
  });

  it('should verify exact printed page number mapping for Sharh Sahih Muslim Vol 5', () => {
    // Preliminary scans
    expect(getSharahMuslimPrintedPage(5, 1)).toBe(1);
    expect(getSharahMuslimPrintedPage(5, 2)).toBe(1);
    expect(getSharahMuslimPdfPage(5, 1)).toBe(1);

    // Content: scan 3 -> printed 2, scan 4 -> printed 3
    expect(getSharahMuslimPrintedPage(5, 3)).toBe(2);
    expect(getSharahMuslimPdfPage(5, 2)).toBe(3);
    expect(getSharahMuslimPrintedPage(5, 4)).toBe(3);
    expect(getSharahMuslimPdfPage(5, 3)).toBe(4);

    // Milestone pages: scan 101 -> printed 100
    expect(getSharahMuslimPrintedPage(5, 101)).toBe(100);
    expect(getSharahMuslimPdfPage(5, 100)).toBe(101);

    // Scan 501 -> printed 500
    expect(getSharahMuslimPrintedPage(5, 501)).toBe(500);
    expect(getSharahMuslimPdfPage(5, 500)).toBe(501);

    // Final scan 982 -> printed 981
    expect(getSharahMuslimPrintedPage(5, 982)).toBe(981);
    expect(getSharahMuslimPdfPage(5, 981)).toBe(982);
  });

  it('should verify exact printed page number mapping for Sharh Sahih Muslim Vol 6', () => {
    // 1-to-1 mapping
    expect(getSharahMuslimPrintedPage(6, 1)).toBe(1);
    expect(getSharahMuslimPdfPage(6, 1)).toBe(1);

    expect(getSharahMuslimPrintedPage(6, 50)).toBe(50);
    expect(getSharahMuslimPdfPage(6, 50)).toBe(50);

    expect(getSharahMuslimPrintedPage(6, 100)).toBe(100);
    expect(getSharahMuslimPdfPage(6, 100)).toBe(100);

    expect(getSharahMuslimPrintedPage(6, 400)).toBe(400);
    expect(getSharahMuslimPdfPage(6, 400)).toBe(400);

    expect(getSharahMuslimPrintedPage(6, 1262)).toBe(1262);
    expect(getSharahMuslimPdfPage(6, 1262)).toBe(1262);
  });

  it('should verify exact printed page number mapping for Sharh Sahih Muslim Vol 7', () => {
    // Preliminary scans
    expect(getSharahMuslimPrintedPage(7, 1)).toBe(1);
    expect(getSharahMuslimPrintedPage(7, 2)).toBe(1);
    expect(getSharahMuslimPdfPage(7, 1)).toBe(1);

    // Content: scan 3 -> printed 2, scan 6 -> printed 5
    expect(getSharahMuslimPrintedPage(7, 3)).toBe(2);
    expect(getSharahMuslimPdfPage(7, 2)).toBe(3);
    expect(getSharahMuslimPrintedPage(7, 6)).toBe(5);
    expect(getSharahMuslimPdfPage(7, 5)).toBe(6);

    // Milestone pages: scan 51 -> printed 50
    expect(getSharahMuslimPrintedPage(7, 51)).toBe(50);
    expect(getSharahMuslimPdfPage(7, 50)).toBe(51);

    // Scan 200 -> printed 199
    expect(getSharahMuslimPrintedPage(7, 200)).toBe(199);
    expect(getSharahMuslimPdfPage(7, 199)).toBe(200);

    // Final scan 1103 -> printed 1102
    expect(getSharahMuslimPrintedPage(7, 1103)).toBe(1102);
    expect(getSharahMuslimPdfPage(7, 1102)).toBe(1103);
  });

  it('should verify SharahMuslimPdfService generates correct image URLs for all volumes', () => {
    expect(SharahMuslimPdfService.getPageImageUrl(1, 1)).toBe('/sharah-muslim/jild-1/page_1.webp');
    expect(SharahMuslimPdfService.getPageImageUrl(1037, 2)).toBe('/sharah-muslim/jild-2/page_1037.webp');
    expect(SharahMuslimPdfService.getPageImageUrl(1194, 3)).toBe('/sharah-muslim/jild-3/page_1194.webp');
    expect(SharahMuslimPdfService.getPageImageUrl(911, 4)).toBe('/sharah-muslim/jild-4/page_911.webp');
    expect(SharahMuslimPdfService.getPageImageUrl(982, 5)).toBe('/sharah-muslim/jild-5/page_982.webp');
    expect(SharahMuslimPdfService.getPageImageUrl(1262, 6)).toBe('/sharah-muslim/jild-6/page_1262.webp');
    expect(SharahMuslimPdfService.getPageImageUrl(1103, 7)).toBe('/sharah-muslim/jild-7/page_1103.webp');
  });

  it('should verify BookReaderPage routes Sharh Sahih Muslim to SharahMuslimReader', () => {
    const readerPagePath = path.resolve(__dirname, '../pages/Library/BookReaderPage.tsx');
    const code = fs.readFileSync(readerPagePath, 'utf8');
    expect(code).toContain('SharahMuslimReader');
    expect(code).toContain("bookId === 'sharah-sahih-muslim'");
    expect(code).toContain("searchParams.get('type') === 'sharh'");
  });

  it('should verify BookDetailPage renders clean header container with Sharh toggle button and separate 7-volume cards view', () => {
    const detailPagePath = path.resolve(__dirname, '../pages/Library/BookDetailPage.tsx');
    const code = fs.readFileSync(detailPagePath, 'utf8');
    expect(code).toContain("book.id === 'sahih-muslim'");
    expect(code).toContain('muslim-header-container');
    expect(code).toContain('Sahih Muslim Sharif Sharh');
    expect(code).toContain('Allama Ghulam Rasool Saeedi');
    expect(code).toContain('SharahMuslimSelectionCoverCanvas');
    expect(code).toContain('/library/sahih-muslim/read?type=sharh&vol=');
  });

  it('should verify no Archive.org iframe or external embed branding is present in reader code', () => {
    const readerPath = path.resolve(__dirname, '../components/library/SharahMuslimReader.tsx');
    const readerCode = fs.readFileSync(readerPath, 'utf8');
    expect(readerCode).not.toContain('<iframe');
    expect(readerCode).not.toContain('archive.org');
  });

  it('should verify SharahMuslimReader toolbar matches Sahih Muslim reader with Page No. label and controls', () => {
    const readerPath = path.resolve(__dirname, '../components/library/SharahMuslimReader.tsx');
    const readerCode = fs.readFileSync(readerPath, 'utf8');

    // Matches Sahih Muslim reader container and toolbar classes
    expect(readerCode).toContain('muslim-top-toolbar');
    expect(readerCode).toContain('muslim-page-search-container');
    expect(readerCode).toContain('muslim-vertical-reading-stream');

    // Clearly displays 'Page No.' label
    expect(readerCode).toContain('Page No.');
    expect(readerCode).toContain('aria-label="Page No."');
    expect(readerCode).toContain('title="Page No."');

    // Page search functionality matches printed page bounds
    expect(readerCode).toContain('max={totalPrintedPages}');
    expect(readerCode).toContain('/ {totalPrintedPages}');
    expect(readerCode).toContain('handleDirectPageSubmit');
    expect(readerCode).toContain('getSharahMuslimPdfPage(volNum, parsed)');

    // Standard Zoom and Fullscreen controls
    expect(readerCode).toContain('zoom-dropdown-menu');
    expect(readerCode).toContain('Toggle Fullscreen');
  });
});
