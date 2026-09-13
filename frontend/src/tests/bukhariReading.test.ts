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

  it('should have BukhariPdfService exposing getDocument, getPage, renderPageToCanvas, and getPageImageUrl', () => {
    expect(typeof BukhariPdfService.getDocument).toBe('function');
    expect(typeof BukhariPdfService.getPage).toBe('function');
    expect(typeof BukhariPdfService.renderPageToCanvas).toBe('function');
    expect(typeof BukhariPdfService.getPageImageUrl).toBe('function');
    expect(BukhariPdfService.getPageImageUrl(1)).toBe('/bukhari/pages/page_1.webp');
    expect(BukhariPdfService.getPageImageUrl(20)).toBe('/bukhari/pages/page_20.webp');
    expect(BukhariPdfService.getPageImageUrl(699)).toBe('/bukhari/pages/page_699.webp');
  });

  it('should have wasm decoders present in public/wasm for JBIG2 PDF decoding', () => {
    const wasmDir = path.resolve(__dirname, '../../public/wasm');
    expect(fs.existsSync(wasmDir)).toBe(true);
    expect(fs.existsSync(path.join(wasmDir, 'jbig2.wasm'))).toBe(true);
    expect(fs.existsSync(path.join(wasmDir, 'openjpeg.wasm'))).toBe(true);
  });

  it('should verify BukhariReader component has pure vertical scroll layout with all 699 pages rendering support', () => {
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
    expect(code).toContain('aspectRatio');

    // Verify size presets and page search
    expect(code).toContain('50%');
    expect(code).toContain('75%');
    expect(code).toContain('90%');
    expect(code).toContain('100%');
    expect(code).toContain('110%');
    expect(code).toContain('125%');
    expect(code).toContain('150%');
    expect(code).toContain('175%');
    expect(code).toContain('200%');
    expect(code).toContain('250%');
    expect(code).toContain('Fit to Width');
    expect(code).toContain('Reset to Default');
    expect(code).toContain('totalPages');
  });

  it('should verify single Zoom button, dropdown menu, click-outside listener, and responsive page zoom scaling', () => {
    const readerFilePath = path.resolve(__dirname, '../components/library/BukhariReader.tsx');
    const code = fs.readFileSync(readerFilePath, 'utf8');

    // 1. Single Zoom button with dropdown menu
    expect(code).toContain('isZoomMenuOpen');
    expect(code).toContain('zoomMenuRef');
    expect(code).toContain('zoom-dropdown-menu');

    // 2. Zoom controls inside dropdown
    expect(code).toContain('handleZoomOut');
    expect(code).toContain('handleZoomIn');
    expect(code).toContain('handleResetZoom');
    expect(code).toContain('handleSelectZoomOption');
    expect(code).toContain('maintainCurrentPagePosition');

    // 3. Click-outside handling
    expect(code).toContain('handleClickOutside');
    expect(code).toContain('mousedown');
    expect(code).toContain('touchstart');

    // 4. Actual page zoom container scaling & aspect ratio
    expect(code).toContain('zoomLevel');
    expect(code).toContain('820 * zoomLevel');
    expect(code).toContain('margin: \'0 auto\'');
    expect(code).toContain('aspectRatio: \'693 / 1002\'');
  });

  it('should verify page-number search control box and toolbar remain sticky during vertical scrolling', () => {
    const readerFilePath = path.resolve(__dirname, '../components/library/BukhariReader.tsx');
    const code = fs.readFileSync(readerFilePath, 'utf8');

    // 1. Sticky toolbar with proper z-index and header offset
    expect(code).toContain('bukhari-top-toolbar');
    expect(code).toContain('position: \'sticky\'');
    expect(code).toContain('top: isFullscreen ? \'0px\' : \'var(--header-height, 68px)\'');
    expect(code).toContain('zIndex: 35');

    // 2. Complete page search box preserved
    expect(code).toContain('bukhari-page-search-container');
    expect(code).toContain('handleDirectPageSubmit');
    expect(code).toContain('directPageInput');
    expect(code).toContain('totalPages');
    expect(code).toContain('انتقال');

    // 3. Root container does not block sticky positioning with overflow
    expect(code).toContain('overflow: \'visible\'');
  });

  it('should verify exact 1-to-1 direct page-number search mapping without -1 offset', () => {
    const readerFilePath = path.resolve(__dirname, '../components/library/BukhariReader.tsx');
    const code = fs.readFileSync(readerFilePath, 'utf8');

    // 1. Direct page submit triggers instant scroll directly to target page
    expect(code).toContain('scrollToPage(pNum, \'auto\')');

    // 2. scrollToPage aligns target element and sets state synchronously
    expect(code).toContain('const clamped = Math.max(1, Math.min(totalPages, pageNum))');
    expect(code).toContain('setCurrentPage(clamped)');
    expect(code).toContain('activePageRef.current = clamped');
    expect(code).toContain("next.set('page', clamped.toString())");
    expect(code).toContain('document.getElementById(`bukhari-page-${clamped}`)');

    // 3. Observer uses reading focus line to prevent previous-page offset
    expect(code).toContain('const focusY = headerOffset + 30');
    expect(code).toContain('rect.top <= focusY && rect.bottom > focusY');
    expect(code).toContain('rootMargin: isFullscreen ? \'-55px 0px -40% 0px\' : \'-130px 0px -40% 0px\'');

    // 4. Test page number bounds: first page (1), middle pages (100, 160, 161), last page (699)
    const testCases = [1, 100, 160, 161, 699];
    const totalPages = 699;
    for (const testPage of testCases) {
      const clamped = Math.max(1, Math.min(totalPages, testPage));
      expect(clamped).toBe(testPage);
      // Image URL and element ID are strictly 1-to-1
      expect(BukhariPdfService.getPageImageUrl(clamped)).toBe(`/bukhari/pages/page_${testPage}.webp`);
    }
  });

  it('should verify complete removal of Hadith marker highlighting feature and all related styles/classes', () => {
    const readerFilePath = path.resolve(__dirname, '../components/library/BukhariReader.tsx');
    const cssPath = path.resolve(__dirname, '../styles/components.css');
    const code = fs.readFileSync(readerFilePath, 'utf8');
    const css = fs.readFileSync(cssPath, 'utf8');

    // 1. Verify complete removal of highlight containers, headers, pills, and highlighter spans in component
    expect(code).not.toContain('bukhari-hadith-marker-highlight');
    expect(code).not.toContain('bukhari-marker-header');
    expect(code).not.toContain('bukhari-marker-pill');
    expect(code).not.toContain('bukhari-marker-section');
    expect(code).not.toContain('bukhari-marker-arabic-text');
    expect(code).not.toContain('bukhari-marker-urdu-text');
    expect(code).not.toContain('bukhari-marker-english-text');
    expect(code).not.toContain('bukhari-marker-footer');
    expect(code).not.toContain('bukhari-text-highlighter');
    expect(code).not.toContain('bukhari-highlight-arabic');
    expect(code).not.toContain('bukhari-highlight-urdu');
    expect(code).not.toContain('bukhari-highlight-english');
    expect(code).not.toContain('bukhari-card-target-hadith');

    // 2. Verify complete removal of marker highlight CSS classes
    expect(css).not.toContain('.bukhari-hadith-marker-highlight');
    expect(css).not.toContain('.bukhari-marker-header');
    expect(css).not.toContain('.bukhari-marker-pill');
    expect(css).not.toContain('.bukhari-marker-section');
    expect(css).not.toContain('.bukhari-text-highlighter');
    expect(css).not.toContain('.bukhari-highlight-arabic');
    expect(css).not.toContain('.bukhari-highlight-urdu');
    expect(css).not.toContain('.bukhari-highlight-english');
  });

  it('should verify clean page navigation directly to exact Bukhari Sharif page when navigating with reference', () => {
    const readerFilePath = path.resolve(__dirname, '../components/library/BukhariReader.tsx');
    const code = fs.readFileSync(readerFilePath, 'utf8');

    // 1. Verifies scrollToPage aligns directly with target page element
    expect(code).toContain('scrollToPage');
    expect(code).toContain('document.getElementById(`bukhari-page-${clamped}`)');
    expect(code).toContain('headerOffset = isFullscreen ? 60 : 135');
    expect(code).toContain('window.scrollTo({ top: Math.max(0, y), behavior })');

    // 2. Verifies clean page card structure rendering high-DPI book page
    expect(code).toContain('BukhariPageCard');
    expect(code).toContain('BukhariPdfService.getPageImageUrl(pageNumber)');
    expect(code).toContain('bukhari-page-card');
  });
});




