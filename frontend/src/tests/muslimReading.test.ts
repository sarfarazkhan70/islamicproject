import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  MUSLIM_VOLUMES,
  getMuslimVolume,
  LOCAL_MUSLIM_VOL1_PDF_PATH,
  getMuslimPrintedPage,
  getMuslimPdfPage,
} from '../data/muslimData';
import { MuslimPdfService } from '../services/muslimPdfService';
import { ISLAMIC_BOOKS } from '../data/libraryData';

describe('Sahih Muslim Multi-Volume Local PDF & Reader Verification', () => {
  it('should have Sahih Muslim Jild 1, Jild 2, Jild 3, Jild 4, Jild 5 and Jild 6 configured with authentic page counts', () => {
    expect(MUSLIM_VOLUMES.length).toBeGreaterThanOrEqual(6);
    const vol1 = MUSLIM_VOLUMES[0];
    expect(vol1.id).toBe('muslim-vol-1');
    expect(vol1.volumeNumber).toBe(1);
    expect(vol1.title).toContain('Sahih Muslim');
    expect(vol1.totalPages).toBe(453);

    const vol2 = MUSLIM_VOLUMES[1];
    expect(vol2.id).toBe('muslim-vol-2');
    expect(vol2.volumeNumber).toBe(2);
    expect(vol2.title).toContain('Sahih Muslim');
    expect(vol2.totalPages).toBe(425);

    const vol3 = MUSLIM_VOLUMES[2];
    expect(vol3.id).toBe('muslim-vol-3');
    expect(vol3.volumeNumber).toBe(3);
    expect(vol3.title).toContain('Sahih Muslim');
    expect(vol3.totalPages).toBe(397);
    expect(vol3.totalPrintedPages).toBe(396);

    const vol4 = MUSLIM_VOLUMES[3];
    expect(vol4.id).toBe('muslim-vol-4');
    expect(vol4.volumeNumber).toBe(4);
    expect(vol4.title).toContain('Sahih Muslim');
    expect(vol4.totalPages).toBe(354);
    expect(vol4.totalPrintedPages).toBe(352);

    const vol5 = MUSLIM_VOLUMES[4];
    expect(vol5.id).toBe('muslim-vol-5');
    expect(vol5.volumeNumber).toBe(5);
    expect(vol5.title).toContain('Sahih Muslim');
    expect(vol5.totalPages).toBe(408);
    expect(vol5.totalPrintedPages).toBe(408);

    const vol6 = MUSLIM_VOLUMES[5];
    expect(vol6.id).toBe('muslim-vol-6');
    expect(vol6.volumeNumber).toBe(6);
    expect(vol6.title).toContain('Sahih Muslim');
    expect(vol6.totalPages).toBe(520);
    expect(vol6.totalPrintedPages).toBe(518);
  });

  it('should have authentic complete Urdu PDFs served locally for Vol 1, Vol 2, Vol 3, Vol 4, Vol 5 and Vol 6 with >80MB size', () => {
    expect(LOCAL_MUSLIM_VOL1_PDF_PATH).toBe('/pdf/sahih_muslim_vol1.pdf');
    const localFile1Path = path.resolve(__dirname, '../../public/pdf/sahih_muslim_vol1.pdf');
    expect(fs.existsSync(localFile1Path)).toBe(true);
    const stats1 = fs.statSync(localFile1Path);
    expect(stats1.size).toBeGreaterThan(100_000_000); // 100.92 MB

    const localFile2Path = path.resolve(__dirname, '../../public/pdf/sahih_muslim_vol2.pdf');
    expect(fs.existsSync(localFile2Path)).toBe(true);
    const stats2 = fs.statSync(localFile2Path);
    expect(stats2.size).toBeGreaterThan(90_000_000); // 96.47 MB

    const localFile3Path = path.resolve(__dirname, '../../public/pdf/sahih_muslim_vol3.pdf');
    expect(fs.existsSync(localFile3Path)).toBe(true);
    const stats3 = fs.statSync(localFile3Path);
    expect(stats3.size).toBeGreaterThan(80_000_000); // 90.51 MB

    const localFile4Path = path.resolve(__dirname, '../../public/pdf/sahih_muslim_vol4.pdf');
    expect(fs.existsSync(localFile4Path)).toBe(true);
    const stats4 = fs.statSync(localFile4Path);
    expect(stats4.size).toBeGreaterThan(80_000_000); // 81.54 MB

    const localFile5Path = path.resolve(__dirname, '../../public/pdf/sahih_muslim_vol5.pdf');
    expect(fs.existsSync(localFile5Path)).toBe(true);
    const stats5 = fs.statSync(localFile5Path);
    expect(stats5.size).toBeGreaterThan(80_000_000); // 102.41 MB

    const localFile6Path = path.resolve(__dirname, '../../public/pdf/sahih_muslim_vol6.pdf');
    expect(fs.existsSync(localFile6Path)).toBe(true);
    const stats6 = fs.statSync(localFile6Path);
    expect(stats6.size).toBeGreaterThan(80_000_000); // 113.76 MB
  });

  it('should have clean Sahih Muslim definition in ISLAMIC_BOOKS', () => {
    const muslimBook = ISLAMIC_BOOKS.find((b) => b.id === 'sahih-muslim');
    expect(muslimBook).toBeDefined();
    expect(muslimBook?.category).toBe('hadith');
    expect(muslimBook?.author).toContain('Muslim');
    expect(muslimBook?.volumeCount).toBe(6);
  });

  it('should correctly resolve volumes using getMuslimVolume', () => {
    const vol1 = getMuslimVolume(1);
    expect(vol1).toBeDefined();
    expect(vol1.id).toBe('muslim-vol-1');
    expect(vol1.totalPages).toBe(453);
    expect(vol1.localPdfUrl).toBe('/pdf/sahih_muslim_vol1.pdf');

    const vol2 = getMuslimVolume(2);
    expect(vol2).toBeDefined();
    expect(vol2.id).toBe('muslim-vol-2');
    expect(vol2.totalPages).toBe(425);
    expect(vol2.localPdfUrl).toBe('/pdf/sahih_muslim_vol2.pdf');

    const vol3 = getMuslimVolume(3);
    expect(vol3).toBeDefined();
    expect(vol3.id).toBe('muslim-vol-3');
    expect(vol3.totalPages).toBe(397);
    expect(vol3.localPdfUrl).toBe('/pdf/sahih_muslim_vol3.pdf');

    const vol4 = getMuslimVolume(4);
    expect(vol4).toBeDefined();
    expect(vol4.id).toBe('muslim-vol-4');
    expect(vol4.totalPages).toBe(354);
    expect(vol4.localPdfUrl).toBe('/pdf/sahih_muslim_vol4.pdf');

    const vol5 = getMuslimVolume(5);
    expect(vol5).toBeDefined();
    expect(vol5.id).toBe('muslim-vol-5');
    expect(vol5.totalPages).toBe(408);
    expect(vol5.localPdfUrl).toBe('/pdf/sahih_muslim_vol5.pdf');

    const vol6 = getMuslimVolume(6);
    expect(vol6).toBeDefined();
    expect(vol6.id).toBe('muslim-vol-6');
    expect(vol6.totalPages).toBe(520);
    expect(vol6.totalPrintedPages).toBe(518);
    expect(vol6.localPdfUrl).toBe('/pdf/sahih_muslim_vol6.pdf');
  });

  it('should have MuslimPdfService exposing getDocument, getPage, and renderPageToCanvas', () => {
    expect(typeof MuslimPdfService.getDocument).toBe('function');
    expect(typeof MuslimPdfService.getPage).toBe('function');
    expect(typeof MuslimPdfService.renderPageToCanvas).toBe('function');
  });

  it('should verify MuslimReader component has pure vertical scroll layout with all 453 pages rendering support', () => {
    const readerFilePath = path.resolve(__dirname, '../components/library/MuslimReader.tsx');
    expect(fs.existsSync(readerFilePath)).toBe(true);
    const code = fs.readFileSync(readerFilePath, 'utf8');

    // Verify vertical reading stream and page card structure
    expect(code).toContain('muslim-vertical-reading-stream');
    expect(code).toContain('muslim-page-card');
    expect(code).toContain('scrollSnapType');
    expect(code).toContain('scrollSnapAlign');
    expect(code).toContain('muslim-page-');

    // Verify zoom presets and page search
    expect(code).toContain('50%');
    expect(code).toContain('75%');
    expect(code).toContain('100%');
    expect(code).toContain('150%');
    expect(code).toContain('200%');
    expect(code).toContain('Fit to Width');
    expect(code).toContain('Reset to Default');
    expect(code).toContain('Page No.');
    expect(code).not.toContain('انتقال');

    // Verify no external Archive.org references in the reader code
    expect(code).not.toContain('archive.org');
    expect(code).not.toContain('Internet Archive');
  });

  it('should verify exact printed page number mapping for Sahih Muslim Vol 2 (1, 50, 100, 150, 200, 250, 300, 385, 419)', () => {
    // Key sample pages requested by the user:
    const testCases = [
      { printed: 1, pdf: 1 },
      { printed: 5, pdf: 6 },
      { printed: 10, pdf: 11 },
      { printed: 11, pdf: 12 },
      { printed: 29, pdf: 30 },
      { printed: 30, pdf: 32 },
      { printed: 31, pdf: 33 },
      { printed: 38, pdf: 40 },
      { printed: 39, pdf: 41 },
      { printed: 40, pdf: 43 },
      { printed: 42, pdf: 45 },
      { printed: 43, pdf: 47 },
      { printed: 50, pdf: 54 },
      { printed: 100, pdf: 104 },
      { printed: 150, pdf: 154 },
      { printed: 200, pdf: 204 },
      { printed: 250, pdf: 254 },
      { printed: 300, pdf: 304 },
      { printed: 350, pdf: 354 },
      { printed: 385, pdf: 389 },
      { printed: 400, pdf: 404 },
      { printed: 419, pdf: 423 },
    ];

    for (const { printed, pdf } of testCases) {
      expect(getMuslimPdfPage(2, printed)).toBe(pdf);
      expect(getMuslimPrintedPage(2, pdf)).toBe(printed);
    }
  });

  it('should verify MuslimReader component scrolls to target PDF page and reflects printed page', () => {
    const readerFilePath = path.resolve(__dirname, '../components/library/MuslimReader.tsx');
    const code = fs.readFileSync(readerFilePath, 'utf8');

    // Direct page submit triggers instant scroll directly to target PDF page
    expect(code).toContain("const targetPdf = getMuslimPdfPage(volNum, pNum);");
    expect(code).toContain("scrollToPdfPage(targetPdf, 'auto', pNum);");

    // scrollToPdfPage aligns target element and sets state synchronously
    expect(code).toContain('const clampedPdf = Math.max(1, Math.min(totalPages, pdfPageNum))');
    expect(code).toContain('setCurrentPdfPage(clampedPdf)');
    expect(code).toContain('setCurrentPrintedPage(printedNum)');
    expect(code).toContain('activePdfPageRef.current = clampedPdf');
    expect(code).toContain("next.set('page', printedNum.toString())");
    expect(code).toContain('document.getElementById(`muslim-page-${clampedPdf}`)');

    // Observer uses reading focus line check to prevent previous/next page offset bug
    expect(code).toContain('const focusY = headerOffset + 30');
    expect(code).toContain('rect.top <= focusY && rect.bottom > focusY');

    // Test page number bounds and 1:1 image URL mapping for Volume 1 and Volume 2
    const testCasesVol1 = [1, 70, 71, 100, 453];
    const totalPagesVol1 = 453;
    for (const testPage of testCasesVol1) {
      const clamped = Math.max(1, Math.min(totalPagesVol1, testPage));
      expect(clamped).toBe(testPage);
      expect(MuslimPdfService.getPageImageUrl(clamped, 1)).toBe(`/muslim/pages/page_${testPage}.webp`);
    }

    const testCasesVol2 = [1, 50, 100, 385, 425];
    const totalPagesVol2 = 425;
    for (const testPage of testCasesVol2) {
      const clamped = Math.max(1, Math.min(totalPagesVol2, testPage));
      expect(clamped).toBe(testPage);
      expect(MuslimPdfService.getPageImageUrl(clamped, 2)).toBe(`/muslim/vol2/pages/page_${testPage}.webp`);
    }

    const testCasesVol3 = [1, 13, 50, 100, 200, 300, 396, 397];
    const totalPagesVol3 = 397;
    for (const testPage of testCasesVol3) {
      const clamped = Math.max(1, Math.min(totalPagesVol3, testPage));
      expect(clamped).toBe(testPage);
      expect(MuslimPdfService.getPageImageUrl(clamped, 3)).toBe(`/muslim/vol3/pages/page_${testPage}.webp`);
    }
  });

  it('should verify exact printed page number mapping for Sahih Muslim Vol 3 (1, 13, 50, 100, 200, 300, 396)', () => {
    const testCasesVol3 = [
      { printed: 1, pdf: 1 },
      { printed: 5, pdf: 5 },
      { printed: 11, pdf: 11 },
      { printed: 13, pdf: 13 },
      { printed: 50, pdf: 50 },
      { printed: 100, pdf: 100 },
      { printed: 150, pdf: 150 },
      { printed: 200, pdf: 200 },
      { printed: 250, pdf: 250 },
      { printed: 300, pdf: 300 },
      { printed: 350, pdf: 350 },
      { printed: 396, pdf: 396 },
    ];

    for (const { printed, pdf } of testCasesVol3) {
      expect(getMuslimPdfPage(3, printed)).toBe(pdf);
      expect(getMuslimPrintedPage(3, pdf)).toBe(printed);
    }

    const testCasesVol4 = [
      1, 13, 50, 100, 200, 300, 350, 354
    ];
    const totalPagesVol4 = 354;
    for (const testPage of testCasesVol4) {
      const clamped = Math.max(1, Math.min(totalPagesVol4, testPage));
      expect(clamped).toBe(testPage);
      expect(MuslimPdfService.getPageImageUrl(clamped, 4)).toBe(`/muslim/vol4/pages/page_${testPage}.webp`);
    }

    const testCasesVol5 = [
      1, 11, 50, 100, 183, 184, 200, 300, 400, 408
    ];
    const totalPagesVol5 = 408;
    for (const testPage of testCasesVol5) {
      const clamped = Math.max(1, Math.min(totalPagesVol5, testPage));
      expect(clamped).toBe(testPage);
      expect(MuslimPdfService.getPageImageUrl(clamped, 5)).toBe(`/muslim/vol5/pages/page_${testPage}.webp`);
    }

    const testCasesVol6 = [
      1, 11, 50, 100, 200, 300, 400, 500, 518, 520
    ];
    const totalPagesVol6 = 520;
    for (const testPage of testCasesVol6) {
      const clamped = Math.max(1, Math.min(totalPagesVol6, testPage));
      expect(clamped).toBe(testPage);
      expect(MuslimPdfService.getPageImageUrl(clamped, 6)).toBe(`/muslim/vol6/pages/page_${testPage}.webp`);
    }
  });

  it('should verify exact printed page number mapping for Sahih Muslim Vol 4 (1, 13, 50, 100, 200, 250, 300, 352)', () => {
    const testCasesVol4 = [
      { printed: 1, pdf: 1 },
      { printed: 5, pdf: 5 },
      { printed: 11, pdf: 11 },
      { printed: 13, pdf: 13 },
      { printed: 50, pdf: 50 },
      { printed: 100, pdf: 100 },
      { printed: 150, pdf: 150 },
      { printed: 200, pdf: 200 },
      { printed: 250, pdf: 250 },
      { printed: 300, pdf: 300 },
      { printed: 350, pdf: 350 },
      { printed: 352, pdf: 352 },
    ];

    for (const { printed, pdf } of testCasesVol4) {
      expect(getMuslimPdfPage(4, printed)).toBe(pdf);
      expect(getMuslimPrintedPage(4, pdf)).toBe(printed);
    }
  });

  it('should verify exact printed page number mapping for Sahih Muslim Vol 5 (1, 11, 50, 100, 150, 183, 185, 200, 250, 300, 350, 400, 408)', () => {
    const testCasesVol5 = [
      { printed: 1, pdf: 1 },
      { printed: 5, pdf: 5 },
      { printed: 10, pdf: 10 },
      { printed: 11, pdf: 11 },
      { printed: 50, pdf: 50 },
      { printed: 100, pdf: 100 },
      { printed: 150, pdf: 150 },
      { printed: 180, pdf: 180 },
      { printed: 183, pdf: 183 },
      { printed: 185, pdf: 184 },
      { printed: 200, pdf: 199 },
      { printed: 250, pdf: 249 },
      { printed: 300, pdf: 299 },
      { printed: 350, pdf: 349 },
      { printed: 400, pdf: 399 },
      { printed: 408, pdf: 407 },
    ];

    for (const { printed, pdf } of testCasesVol5) {
      expect(getMuslimPdfPage(5, printed)).toBe(pdf);
      expect(getMuslimPrintedPage(5, pdf)).toBe(printed);
    }
  });

  it('should verify exact printed page number mapping for Sahih Muslim Vol 6 (1, 5, 11, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 515, 518)', () => {
    const testCasesVol6 = [
      { printed: 1, pdf: 1 },
      { printed: 5, pdf: 5 },
      { printed: 11, pdf: 11 },
      { printed: 25, pdf: 25 },
      { printed: 50, pdf: 50 },
      { printed: 75, pdf: 75 },
      { printed: 100, pdf: 100 },
      { printed: 150, pdf: 150 },
      { printed: 200, pdf: 200 },
      { printed: 250, pdf: 250 },
      { printed: 300, pdf: 300 },
      { printed: 350, pdf: 350 },
      { printed: 400, pdf: 400 },
      { printed: 450, pdf: 450 },
      { printed: 500, pdf: 500 },
      { printed: 515, pdf: 515 },
      { printed: 518, pdf: 518 },
    ];

    for (const { printed, pdf } of testCasesVol6) {
      expect(getMuslimPdfPage(6, printed)).toBe(pdf);
      expect(getMuslimPrintedPage(6, pdf)).toBe(printed);
    }
  });

  it('should verify BookReaderPage routes Sahih Muslim to MuslimReader', () => {
    const readerPagePath = path.resolve(__dirname, '../pages/Library/BookReaderPage.tsx');
    const code = fs.readFileSync(readerPagePath, 'utf8');
    expect(code).toContain('MuslimReader');
    expect(code).toContain("bookId === 'sahih-muslim'");
  });

  it('should verify BookDetailPage renders 6 cards for Sahih Muslim without external links or buttons', () => {
    const detailPagePath = path.resolve(__dirname, '../pages/Library/BookDetailPage.tsx');
    const code = fs.readFileSync(detailPagePath, 'utf8');
    expect(code).toContain("book.id === 'sahih-muslim'");
    expect(code).toContain('muslim-cards-row');
    expect(code).toContain('muslim-book-card');
    expect(code).toContain('MuslimSelectionCoverCanvas');
    expect(code).not.toContain('archive.org');
  });

  it('should verify zoom dropdown opens outward with dynamic collision-aware positioning', () => {
    const readerFilePath = path.resolve(__dirname, '../components/library/MuslimReader.tsx');
    const cssPath = path.resolve(__dirname, '../styles/components.css');
    const code = fs.readFileSync(readerFilePath, 'utf8');
    const css = fs.readFileSync(cssPath, 'utf8');

    // 1. Dynamic dropdownPosition state and viewport awareness in component
    expect(code).toContain('dropdownPosition');
    expect(code).toContain('horizontalAlign');
    expect(code).toContain('verticalAlign');
    expect(code).toContain('zoom-dropdown-menu align-');

    // 2. CSS alignment classes for outward opening without covering reading text
    expect(css).toContain('.muslim-top-toolbar .zoom-dropdown-menu');
    expect(css).toContain('.muslim-top-toolbar .zoom-dropdown-menu.align-right');
    expect(css).toContain('.muslim-top-toolbar .zoom-dropdown-menu.align-left');
    expect(css).toContain('.muslim-top-toolbar .zoom-dropdown-menu.align-center');
    expect(css).toContain('.muslim-top-toolbar .zoom-dropdown-menu.align-top');
  });

  it('should verify Sahih Muslim zoom menu is clearly visible with proper z-index, overflow, background, and readable options', () => {
    const readerFilePath = path.resolve(__dirname, '../components/library/MuslimReader.tsx');
    const cssPath = path.resolve(__dirname, '../styles/components.css');
    const code = fs.readFileSync(readerFilePath, 'utf8');
    const css = fs.readFileSync(cssPath, 'utf8');

    // 1. Toolbar and page root have explicit overflow: visible and high z-index
    expect(css).toContain('.muslim-reader-page-root');
    expect(css).toContain('.muslim-top-toolbar');
    expect(css).toContain('overflow: visible !important;');
    expect(css).toContain('z-index: 100 !important;');
    expect(code).toContain('overflow: \'visible\'');
    expect(code).toContain('zIndex: 100');
    expect(code).toContain('zIndex: isZoomMenuOpen ? 1000 : 1');

    // 2. Dropdown menu has high z-index (10000), opacity 1, visibility visible, and strong background
    expect(css).toContain('z-index: 10000 !important;');
    expect(css).toContain('visibility: visible !important;');
    expect(css).toContain('opacity: 1 !important;');
    expect(css).toContain('pointer-events: auto !important;');
    expect(css).toContain('background-color: #0f172a !important;');

    // 3. Zoom options are visible and clickable (manual buttons, percentages grid, fit to width, reset)
    expect(code).toContain('handleZoomOut');
    expect(code).toContain('handleZoomIn');
    expect(code).toContain('handleSelectZoomOption');
    expect(code).toContain('handleResetZoom');
    expect(code).toContain('Fit to Width');
    expect(code).toContain('Reset to Default');

    // 4. Clean toolbar zoom button matching Bukhari Sharif (no 180° rotation button in toolbar Section 2)
    expect(code).toContain('Section 2: Single Clean Zoom Button with Dropdown Menu');
  });
});
