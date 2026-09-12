import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  LOCAL_HADAIQ_PDF_PATH,
  HADAIQ_TOTAL_PDF_PAGES,
  HADAIQ_PRINTED_TOTAL_PAGES,
  HADAIQ_PRINTED_PAGES,
  HADAIQ_KALAMS_INDEX,
  getPdfPageFromPrintedPage,
  getPrintedPageFromPdfPage,
} from '../data/hadaiqData';
import {
  LOCAL_HADAIQ_HINDI_PDF_PATH,
  HADAIQ_HINDI_TOTAL_PDF_PAGES,
  HADAIQ_HINDI_PRINTED_TOTAL_PAGES,
  HADAIQ_HINDI_PRINTED_PAGES,
  getPdfPageFromPrintedPage as getHindiPdfPageFromPrintedPage,
  getPrintedPageFromPdfPage as getHindiPrintedPageFromPdfPage,
} from '../data/hadaiqHindiData';
import {
  LOCAL_HADAIQ_ENGLISH_PDF_PATH,
  HADAIQ_ENGLISH_TOTAL_PDF_PAGES,
  HADAIQ_ENGLISH_PRINTED_TOTAL_PAGES,
  HADAIQ_ENGLISH_PRINTED_PAGES,
  HADAIQ_ENGLISH_KALAMS_INDEX,
  getPdfPageFromPrintedPage as getEnglishPdfPageFromPrintedPage,
  getPrintedPageFromPdfPage as getEnglishPrintedPageFromPdfPage,
} from '../data/hadaiqEnglishData';
import { HadaiqPdfService } from '../services/hadaiqPdfService';
import { getBookById } from '../data/libraryData';

describe('Hadaiq-e-Bakhshish Printed Page Number Mapping (Urdu, Hindi & English)', () => {
  it('should have authentic complete Urdu PDF served at /pdf/hadaiq_e_bakhshish.pdf with >10MB size', () => {
    expect(LOCAL_HADAIQ_PDF_PATH).toBe('/pdf/hadaiq_e_bakhshish.pdf');
    const localFilePath = path.resolve(__dirname, '../../public/pdf/hadaiq_e_bakhshish.pdf');
    expect(fs.existsSync(localFilePath)).toBe(true);
    const stats = fs.statSync(localFilePath);
    expect(stats.size).toBeGreaterThan(10_000_000); // 10.4 MB authentic complete book PDF
  });

  it('should have 454 total PDF pages and 446 physical printed book pages configured for Urdu edition', () => {
    expect(HADAIQ_TOTAL_PDF_PAGES).toBe(454);
    expect(HADAIQ_PRINTED_TOTAL_PAGES).toBe(446);
    expect(HADAIQ_PRINTED_PAGES.length).toBe(446);
  });

  describe('Urdu Edition Printed Page Mapping Logic', () => {
    it('should map Printed Page 1 to authentic scanned PDF Page 7 (after 6 frontmatter pages)', () => {
      expect(getPdfPageFromPrintedPage(1)).toBe(7);
      expect(HADAIQ_PRINTED_PAGES[0]).toEqual({
        printedPage: 1,
        pdfPage: 7,
        visiblePage: 1,
      });
    });

    it('should map Part 1 printed pages with +6 offset up to page 239 (PDF 245)', () => {
      expect(getPdfPageFromPrintedPage(15)).toBe(21); // Hamd
      expect(getPdfPageFromPrintedPage(78)).toBe(84); // Printed page 78 in scanned book
      expect(getPdfPageFromPrintedPage(153)).toBe(159); // Chamak Tujh Se Paate
      expect(getPdfPageFromPrintedPage(239)).toBe(245);
    });

    it('should account for unnumbered Part 2 divider page (PDF 246) and map Part 2 with +7 offset', () => {
      expect(getPdfPageFromPrintedPage(240)).toBe(247);
      expect(getPdfPageFromPrintedPage(263)).toBe(270);
      expect(getPdfPageFromPrintedPage(272)).toBe(279); // Qasida Merajia
      expect(getPdfPageFromPrintedPage(295)).toBe(302); // Salam-e-Raza
      expect(getPdfPageFromPrintedPage(446)).toBe(453); // Last printed page
    });

    it('should reverse map scanned PDF pages to physical printed pages accurately', () => {
      expect(getPrintedPageFromPdfPage(1)).toBe(1);
      expect(getPrintedPageFromPdfPage(6)).toBe(1);
      expect(getPrintedPageFromPdfPage(7)).toBe(1);
      expect(getPrintedPageFromPdfPage(21)).toBe(15);
      expect(getPrintedPageFromPdfPage(84)).toBe(78);
      expect(getPrintedPageFromPdfPage(159)).toBe(153);
      expect(getPrintedPageFromPdfPage(245)).toBe(239);
      expect(getPrintedPageFromPdfPage(247)).toBe(240);
      expect(getPrintedPageFromPdfPage(279)).toBe(272);
      expect(getPrintedPageFromPdfPage(302)).toBe(295);
      expect(getPrintedPageFromPdfPage(453)).toBe(446);
    });

    it('should have accurate printed page references for all indexed kalams', () => {
      expect(HADAIQ_KALAMS_INDEX.length).toBeGreaterThanOrEqual(50);

      const hamd = HADAIQ_KALAMS_INDEX.find((k) => k.title.includes('واہ کیا جود و کرم'));
      expect(hamd).toBeDefined();
      expect(hamd?.pdfPage).toBe(21);
      expect(hamd?.printedPage).toBe(15);

      const salam = HADAIQ_KALAMS_INDEX.find((k) => k.title.includes('مصطفیٰ جانِ رحمت'));
      expect(salam).toBeDefined();
      expect(salam?.pdfPage).toBe(302);
      expect(salam?.printedPage).toBe(295);

      const merajia = HADAIQ_KALAMS_INDEX.find((k) => k.title.includes('قصیدہ معراجیہ'));
      expect(merajia).toBeDefined();
      expect(merajia?.pdfPage).toBe(279);
      expect(merajia?.printedPage).toBe(272);

      const chamak = HADAIQ_KALAMS_INDEX.find((k) => k.title.includes('چمک تجھ سے پاتے'));
      expect(chamak).toBeDefined();
      expect(chamak?.pdfPage).toBe(159);
      expect(chamak?.printedPage).toBe(153);

      for (const kalam of HADAIQ_KALAMS_INDEX) {
        expect(kalam.printedPage).toBe(getPrintedPageFromPdfPage(kalam.pdfPage));
      }
    });
  });

  describe('Hindi Edition Printed Page Mapping Logic', () => {
    it('should have authentic Hindi PDF served at /pdf/hadaiq_e_bakhshish_hindi.pdf', () => {
      expect(LOCAL_HADAIQ_HINDI_PDF_PATH).toBe('/pdf/hadaiq_e_bakhshish_hindi.pdf');
      const localFilePath = path.resolve(__dirname, '../../public/pdf/hadaiq_e_bakhshish_hindi.pdf');
      expect(fs.existsSync(localFilePath)).toBe(true);
      const stats = fs.statSync(localFilePath);
      expect(stats.size).toBeGreaterThan(2_500_000);
    });

    it('should have 498 total PDF pages and 490 physical printed book pages configured for Hindi edition', () => {
      expect(HADAIQ_HINDI_TOTAL_PDF_PAGES).toBe(498);
      expect(HADAIQ_HINDI_PRINTED_TOTAL_PAGES).toBe(490);
      expect(HADAIQ_HINDI_PRINTED_PAGES.length).toBe(490);
    });

    it('should map Printed Page 1 to authentic scanned PDF Page 8 (after 7 frontmatter pages)', () => {
      expect(getHindiPdfPageFromPrintedPage(1)).toBe(8);
      expect(HADAIQ_HINDI_PRINTED_PAGES[0]).toEqual({
        printedPage: 1,
        pdfPage: 8,
      });
    });

    it('should map all Hindi printed pages with +7 offset up to page 490 (PDF 497)', () => {
      expect(getHindiPdfPageFromPrintedPage(100)).toBe(107);
      expect(getHindiPdfPageFromPrintedPage(200)).toBe(207);
      expect(getHindiPdfPageFromPrintedPage(490)).toBe(497);
    });

    it('should reverse map scanned Hindi PDF pages to physical printed pages accurately', () => {
      expect(getHindiPrintedPageFromPdfPage(1)).toBe(1);
      expect(getHindiPrintedPageFromPdfPage(7)).toBe(1);
      expect(getHindiPrintedPageFromPdfPage(8)).toBe(1);
      expect(getHindiPrintedPageFromPdfPage(107)).toBe(100);
      expect(getHindiPrintedPageFromPdfPage(497)).toBe(490);
    });
  });

  describe('English Edition Printed Page Mapping Logic & Index', () => {
    it('should have authentic English PDF served at /pdf/hadaiq_e_bakhshish_english.pdf', () => {
      expect(LOCAL_HADAIQ_ENGLISH_PDF_PATH).toBe('/pdf/hadaiq_e_bakhshish_english.pdf');
      const localFilePath = path.resolve(__dirname, '../../public/pdf/hadaiq_e_bakhshish_english.pdf');
      expect(fs.existsSync(localFilePath)).toBe(true);
      const stats = fs.statSync(localFilePath);
      expect(stats.size).toBeGreaterThan(2_000_000); // 2.18 MB authentic translation
    });

    it('should have 319 total PDF pages and 319 physical printed book pages configured for English edition', () => {
      expect(HADAIQ_ENGLISH_TOTAL_PDF_PAGES).toBe(319);
      expect(HADAIQ_ENGLISH_PRINTED_TOTAL_PAGES).toBe(319);
      expect(HADAIQ_ENGLISH_PRINTED_PAGES.length).toBe(319);
    });

    it('should map Printed Pages directly 1:1 to authentic scanned PDF Pages', () => {
      expect(getEnglishPdfPageFromPrintedPage(1)).toBe(1);
      expect(getEnglishPdfPageFromPrintedPage(11)).toBe(11);
      expect(getEnglishPdfPageFromPrintedPage(208)).toBe(208);
      expect(getEnglishPdfPageFromPrintedPage(319)).toBe(319);
      expect(getEnglishPrintedPageFromPdfPage(1)).toBe(1);
      expect(getEnglishPrintedPageFromPdfPage(208)).toBe(208);
      expect(getEnglishPrintedPageFromPdfPage(319)).toBe(319);
    });

    it('should contain 100+ indexed kalams in English index with correct page references', () => {
      expect(HADAIQ_ENGLISH_KALAMS_INDEX.length).toBeGreaterThanOrEqual(100);
      const poem1 = HADAIQ_ENGLISH_KALAMS_INDEX.find((k) => k.titleEnglish.includes('Waah Kya Jood'));
      expect(poem1).toBeDefined();
      expect(poem1?.printedPage).toBe(11);
    });
  });

  describe('Main Library Card & 3-Language Selection Screen', () => {
    it('should verify main library page displays a single Hadaiq-e-Bakhshish card navigating to selection screen', () => {
      const bookCardFilePath = path.resolve(__dirname, '../components/library/BookCard.tsx');
      const code = fs.readFileSync(bookCardFilePath, 'utf8');

      expect(code).toContain('/library/hadaiq-e-bakhshish');
    });

    it('should verify BookDetailPage renders all three compact selection cards (Urdu, Hindi, English) with writer name and language labels', () => {
      const detailPageFilePath = path.resolve(__dirname, '../pages/Library/BookDetailPage.tsx');
      const code = fs.readFileSync(detailPageFilePath, 'utf8');

      expect(code).toContain('Writer: Imam Ahmad Raza Khan Barelvi (Ala Hazrat)');
      expect(code).toContain('(Urdu)');
      expect(code).toContain('(Hindi)');
      expect(code).toContain('(Roman Urdu)');
      expect(code).not.toContain('Page No.');
      expect(code).toContain('/library/hadaiq-e-bakhshish/read');
      expect(code).toContain('/library/hadaiq-e-bakhshish-hindi/read');
      expect(code).toContain('/library/hadaiq-e-bakhshish-english/read');
      expect(code).toContain('hadaiq-book-card');
      expect(code).toContain('HadaiqSelectionCoverCanvas');
    });
  });

  describe('Urdu Reader UI & Printed Page Number Indicators', () => {
    it('should verify HadaiqReader uses printed page numbers and clean header without duplicate titles or Arabic/Urdu labels', () => {
      const urduReaderFilePath = path.resolve(__dirname, '../components/library/HadaiqReader.tsx');
      const code = fs.readFileSync(urduReaderFilePath, 'utf8');

      // 1. Printed page search and display
      expect(code).toContain('data-printed-page');
      expect(code).toContain('Page No.');
      expect(code).toContain('Fehrist');
      expect(code).not.toContain('Contents');
      expect(code).not.toContain('Imam Ahmad Raza Khan (Ala Hazrat) • {totalPrintedPages} صفحات');
      expect(code).not.toContain('الصفحة {visiblePageNumber} من {totalVisiblePages}');

      // 2. Zoom dropdown controls
      expect(code).toContain('isZoomMenuOpen');
      expect(code).toContain('zoom-dropdown-menu');
      expect(code).toContain('handleSelectZoomOption');
      expect(code).toContain('handleZoomOut');
      expect(code).toContain('handleZoomIn');
      expect(code).toContain('handleResetZoom');
    });

    it('should verify Fehrist entries panel has wide responsive modal, unclipped Arabic text, and clean page badges', () => {
      const urduReaderFilePath = path.resolve(__dirname, '../components/library/HadaiqReader.tsx');
      const code = fs.readFileSync(urduReaderFilePath, 'utf8');
      const cssFilePath = path.resolve(__dirname, '../styles/components.css');
      const css = fs.readFileSync(cssFilePath, 'utf8');

      // 1. Fehrist Modal & Entry CSS classes and Search Input
      expect(code).toContain('hadaiq-fehrist-overlay');
      expect(code).toContain('hadaiq-fehrist-modal');
      expect(code).toContain('hadaiq-fehrist-list');
      expect(code).toContain('hadaiq-fehrist-item');
      expect(code).toContain('hadaiq-fehrist-title');
      expect(code).toContain('hadaiq-fehrist-tag');
      expect(code).toContain('hadaiq-fehrist-page-badge');
      expect(code).toContain('placeholder="Name search"');
      expect(code).not.toContain('Search Fehrist (e.g.');

      // 2. CSS Rules ensuring wide layout, unclipped Arabic diacritics, and RTL
      expect(css).toContain('.hadaiq-fehrist-modal');
      expect(css).toContain('max-width: 880px');
      expect(css).toContain('.hadaiq-fehrist-item');
      expect(css).toContain('.hadaiq-fehrist-title');
      expect(css).toContain('line-height: 2.1');
      expect(css).toContain('direction: rtl');
      expect(css).toContain('direction: ltr'); // For page badge
      expect(css).toContain('.hadaiq-fehrist-page-badge');
    });
  });

  describe('Hindi Reader UI & Printed Page Number Indicators', () => {
    it('should verify HadaiqHindiReader uses printed page numbers and clean header matching Urdu sem-to-sem', () => {
      const hindiReaderFilePath = path.resolve(__dirname, '../components/library/HadaiqHindiReader.tsx');
      const code = fs.readFileSync(hindiReaderFilePath, 'utf8');

      // 1. Printed page search and display
      expect(code).toContain('data-printed-page');
      expect(code).toContain('Page No.');
      expect(code).toContain('Fehrist');
      expect(code).not.toContain('Contents');
      expect(code).not.toContain('من {totalPages}');

      // 2. Zoom dropdown controls
      expect(code).toContain('isZoomMenuOpen');
      expect(code).toContain('zoom-dropdown-menu');
      expect(code).toContain('handleZoomOut');
      expect(code).toContain('handleZoomIn');
      expect(code).toContain('handleResetZoom');
      expect(code).toContain('handleSelectZoomOption');

      // 3. Fehrist modal and Name search input
      expect(code).toContain('hadaiq-fehrist-overlay');
      expect(code).toContain('hadaiq-fehrist-modal');
      expect(code).toContain('hadaiq-fehrist-list');
      expect(code).toContain('hadaiq-fehrist-item');
      expect(code).toContain('hadaiq-fehrist-title');
      expect(code).toContain('hadaiq-fehrist-tag');
      expect(code).toContain('hadaiq-fehrist-page-badge');
      expect(code).toContain('placeholder="Name search"');
      expect(code).not.toContain('Search Fehrist (e.g.');
    });
  });

  describe('English Reader UI & Printed Page Number Indicators', () => {
    it('should verify HadaiqEnglishReader has full reader feature parity with Urdu and Hindi', () => {
      const englishReaderFilePath = path.resolve(__dirname, '../components/library/HadaiqEnglishReader.tsx');
      const code = fs.readFileSync(englishReaderFilePath, 'utf8');

      // 1. Printed page search and display
      expect(code).toContain('data-printed-page');
      expect(code).toContain('Page No.');
      expect(code).toContain('Fehrist');

      // 2. Zoom dropdown controls
      expect(code).toContain('isZoomMenuOpen');
      expect(code).toContain('zoom-dropdown-menu');
      expect(code).toContain('handleZoomOut');
      expect(code).toContain('handleZoomIn');
      expect(code).toContain('handleResetZoom');
      expect(code).toContain('handleSelectZoomOption');

      // 3. Fehrist modal and Name search input
      expect(code).toContain('hadaiq-fehrist-overlay');
      expect(code).toContain('hadaiq-fehrist-modal');
      expect(code).toContain('hadaiq-fehrist-list');
      expect(code).toContain('hadaiq-fehrist-item');
      expect(code).toContain('hadaiq-fehrist-title');
      expect(code).toContain('hadaiq-fehrist-tag');
      expect(code).toContain('hadaiq-fehrist-page-badge');
      expect(code).toContain('placeholder="Name search"');
    });
  });
});
