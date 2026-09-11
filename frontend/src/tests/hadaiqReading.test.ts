import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  LOCAL_HADAIQ_PDF_PATH,
  HADAIQ_TOTAL_PAGES,
  HADAIQ_VISIBLE_TOTAL_PAGES,
  HADAIQ_SKIPPED_PDF_PAGES,
  HADAIQ_VISIBLE_PAGES,
  HADAIQ_KALAMS_INDEX,
  getPdfPageFromVisiblePage,
  getVisiblePageFromPdfPage,
} from '../data/hadaiqData';
import { HadaiqPdfService } from '../services/hadaiqPdfService';
import { getBookById } from '../data/libraryData';

describe('Hadaiq-e-Bakhshish Archive.org Edition & Naat Index Verification', () => {
  it('should have authentic complete PDF served at /pdf/hadaiq_e_bakhshish.pdf with >10MB size', () => {
    expect(LOCAL_HADAIQ_PDF_PATH).toBe('/pdf/hadaiq_e_bakhshish.pdf');
    const localFilePath = path.resolve(__dirname, '../../public/pdf/hadaiq_e_bakhshish.pdf');
    expect(fs.existsSync(localFilePath)).toBe(true);
    const stats = fs.statSync(localFilePath);
    expect(stats.size).toBeGreaterThan(10_000_000); // 10.4 MB authentic complete book PDF
  });

  it('should have 454 total authentic pages configured', () => {
    expect(HADAIQ_TOTAL_PAGES).toBe(454);
  });

  it('should have rich Naat Index with accurate 1-to-1 PDF page mappings', () => {
    expect(HADAIQ_KALAMS_INDEX.length).toBeGreaterThanOrEqual(50);

    // Verify key landmark kalams
    const hamd = HADAIQ_KALAMS_INDEX.find((k) => k.title.includes('واہ کیا جود و کرم'));
    expect(hamd).toBeDefined();
    expect(hamd?.pdfPage).toBe(21);

    const salam = HADAIQ_KALAMS_INDEX.find((k) => k.title.includes('مصطفیٰ جانِ رحمت'));
    expect(salam).toBeDefined();
    expect(salam?.pdfPage).toBe(302);
    expect(salam?.category).toBe('salam');

    const merajia = HADAIQ_KALAMS_INDEX.find((k) => k.title.includes('قصیدہ معراجیہ'));
    expect(merajia).toBeDefined();
    expect(merajia?.pdfPage).toBe(279);

    const chamak = HADAIQ_KALAMS_INDEX.find((k) => k.title.includes('چمک تجھ سے پاتے'));
    expect(chamak).toBeDefined();
    expect(chamak?.pdfPage).toBe(159);

    const sabSeAula = HADAIQ_KALAMS_INDEX.find((k) => k.title.includes('سب سے اولیٰ'));
    expect(sabSeAula).toBeDefined();
    expect(sabSeAula?.pdfPage).toBe(191);
  });

  it('should ensure all indexed PDF page numbers are strictly within 1..454 range without gaps', () => {
    for (const kalam of HADAIQ_KALAMS_INDEX) {
      expect(kalam.pdfPage).toBeGreaterThanOrEqual(1);
      expect(kalam.pdfPage).toBeLessThanOrEqual(HADAIQ_TOTAL_PAGES);
      expect(kalam.title.trim().length).toBeGreaterThan(0);
      expect(kalam.categoryUrdu.trim().length).toBeGreaterThan(0);
    }
  });

  it('should have clean Hadaiq-e-Bakhshish entry in ISLAMIC_BOOKS', () => {
    const book = getBookById('hadaiq-e-bakhshish');
    expect(book).toBeDefined();
    expect(book?.title).toBe('Hadaiq-e-Bakhshish');
    expect(book?.author).toBe('Imam Ahmad Raza Khan (Ala Hazrat)');
  });

  it('should have HadaiqPdfService exposing getDocument, getPage, and renderPageToCanvas', () => {
    expect(typeof HadaiqPdfService.getDocument).toBe('function');
    expect(typeof HadaiqPdfService.getPage).toBe('function');
    expect(typeof HadaiqPdfService.renderPageToCanvas).toBe('function');
  });

  describe('Hadaiq-e-Bakhshish Visible Page Sequence & Filter Mapping (Pages 2-11 Hidden)', () => {
    it('should have exactly 444 visible pages configured (454 minus 10 skipped pages)', () => {
      expect(HADAIQ_VISIBLE_TOTAL_PAGES).toBe(444);
      expect(HADAIQ_VISIBLE_PAGES.length).toBe(444);
      expect(HADAIQ_SKIPPED_PDF_PAGES).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it('should map Visible Page 1 to Original PDF Page 1', () => {
      expect(getPdfPageFromVisiblePage(1)).toBe(1);
      expect(HADAIQ_VISIBLE_PAGES[0]).toEqual({ visiblePage: 1, pdfPage: 1 });
    });

    it('should map Visible Page 2 directly to Original PDF Page 12, skipping pages 2 to 11', () => {
      expect(getPdfPageFromVisiblePage(2)).toBe(12);
      expect(HADAIQ_VISIBLE_PAGES[1]).toEqual({ visiblePage: 2, pdfPage: 12 });
      expect(getPdfPageFromVisiblePage(3)).toBe(13);
      expect(HADAIQ_VISIBLE_PAGES[2]).toEqual({ visiblePage: 3, pdfPage: 13 });
      expect(getPdfPageFromVisiblePage(4)).toBe(14);
      expect(HADAIQ_VISIBLE_PAGES[3]).toEqual({ visiblePage: 4, pdfPage: 14 });
    });

    it('should map the last Visible Page 444 to the last Original PDF Page 454', () => {
      expect(getPdfPageFromVisiblePage(444)).toBe(454);
      expect(HADAIQ_VISIBLE_PAGES[443]).toEqual({ visiblePage: 444, pdfPage: 454 });
    });

    it('should never contain any skipped PDF pages (2 to 11) in the visible page array', () => {
      const renderedPdfPages = HADAIQ_VISIBLE_PAGES.map((p) => p.pdfPage);
      for (const skipped of HADAIQ_SKIPPED_PDF_PAGES) {
        expect(renderedPdfPages).not.toContain(skipped);
      }
    });

    it('should correctly reverse map original PDF pages to visible pages', () => {
      expect(getVisiblePageFromPdfPage(1)).toBe(1);
      expect(getVisiblePageFromPdfPage(12)).toBe(2);
      expect(getVisiblePageFromPdfPage(13)).toBe(3);
      expect(getVisiblePageFromPdfPage(21)).toBe(11); // Hamd
      expect(getVisiblePageFromPdfPage(302)).toBe(292); // Salam
      expect(getVisiblePageFromPdfPage(454)).toBe(444);
    });
  });
});
