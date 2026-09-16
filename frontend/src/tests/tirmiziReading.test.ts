import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  TIRMIZI_VOLUMES,
  getTirmiziVolume,
  getTirmiziPrintedPage,
  getTirmiziPdfPage,
  LOCAL_TIRMIZI_VOL1_PDF_PATH,
} from '../data/tirmiziData';
import { TirmiziPdfService } from '../services/tirmiziPdfService';

describe('Jami’ at-Tirmidhi Part 1: Authentic Architecture & Reading Experience', () => {
  it('should verify Volume 1 Part 1 metadata correctly loaded with 340 total pages and 353 printed pages', () => {
    const vol1 = getTirmiziVolume(1);
    expect(vol1).toBeDefined();
    expect(vol1.volumeNumber).toBe(1);
    expect(vol1.totalPages).toBe(340);
    expect(vol1.totalPrintedPages).toBe(353);
    expect(vol1.localPdfUrl).toBe(LOCAL_TIRMIZI_VOL1_PDF_PATH);
    expect(vol1.urduTitle).toContain('جامع الترمذی');
    expect(vol1.arabicTitle).toContain('جامع الترمذي');
    expect(TIRMIZI_VOLUMES.length).toBe(6);
  });

  it('should verify exact printed book page number mapping for Volume 1 Part 1', () => {
    // Verified test cases per requirements:
    // Page 1, Page 10, Page 50, Page 100, Page 119, Page 150, and Last printed page (353)
    const testCases = [
      { printed: 1, pdf: 2 },
      { printed: 2, pdf: 3 },
      { printed: 3, pdf: 4 },
      { printed: 5, pdf: 6 },
      { printed: 10, pdf: 11 },
      { printed: 13, pdf: 14 },
      { printed: 29, pdf: 15 },
      { printed: 50, pdf: 36 },
      { printed: 86, pdf: 72 },
      { printed: 100, pdf: 86 },
      { printed: 105, pdf: 91 },
      { printed: 119, pdf: 105 },
      { printed: 150, pdf: 136 },
      { printed: 200, pdf: 186 },
      { printed: 250, pdf: 236 },
      { printed: 300, pdf: 286 },
      { printed: 335, pdf: 321 },
      { printed: 350, pdf: 336 },
      { printed: 353, pdf: 339 }, // Last available printed page
    ];

    for (const { printed, pdf } of testCases) {
      expect(getTirmiziPdfPage(1, printed)).toBe(pdf);
      expect(getTirmiziPrintedPage(1, pdf)).toBe(printed);
    }

    // Front-matter and boundary checks
    expect(getTirmiziPrintedPage(1, 1)).toBe(1); // Cover
    expect(getTirmiziPrintedPage(1, 2)).toBe(1); // Title page
    expect(getTirmiziPrintedPage(1, 3)).toBe(2);
    expect(getTirmiziPrintedPage(1, 4)).toBe(3);
    expect(getTirmiziPrintedPage(1, 14)).toBe(13);
    expect(getTirmiziPrintedPage(1, 15)).toBe(29);
    expect(getTirmiziPrintedPage(1, 86)).toBe(100);
    expect(getTirmiziPrintedPage(1, 105)).toBe(119);
    expect(getTirmiziPrintedPage(1, 136)).toBe(150);
    expect(getTirmiziPrintedPage(1, 339)).toBe(353);
    expect(getTirmiziPrintedPage(1, 340)).toBe(353); // Back cover
  });

  it('should verify Volume 1 Part 2 metadata correctly loaded with 375 total pages and 715 printed pages', () => {
    const vol2 = getTirmiziVolume(2);
    expect(vol2).toBeDefined();
    expect(vol2.volumeNumber).toBe(2);
    expect(vol2.totalPages).toBe(375);
    expect(vol2.totalPrintedPages).toBe(715);
    expect(vol2.localPdfUrl).toBe('/pdf/jami_at_tirmizi_vol1_part2.pdf');
    expect(vol2.urduTitle).toContain('جامع الترمذی — جلد ۱ (پارٹ ۲)');
    expect(vol2.arabicTitle).toContain('جامع الترمذي — المجلد الأول (الجزء الثاني)');
  });

  it('should verify exact printed book page number mapping for Volume 1 Part 2', () => {
    // Specifically required test cases:
    // Page 1, Page 10, Page 50, Page 100, Page 150, Page 200, and last available printed page (715)
    const testCasesPart2 = [
      { searchInput: 1, expectedPdf: 2, expectedPrinted: 1 },
      { searchInput: 2, expectedPdf: 3, expectedPrinted: 2 },
      { searchInput: 10, expectedPdf: 10, expectedPrinted: 19 },
      { searchInput: 13, expectedPdf: 4, expectedPrinted: 13 },
      { searchInput: 15, expectedPdf: 6, expectedPrinted: 15 },
      { searchInput: 21, expectedPdf: 12, expectedPrinted: 21 },
      { searchInput: 50, expectedPdf: 50, expectedPrinted: 391 },
      { searchInput: 100, expectedPdf: 100, expectedPrinted: 441 },
      { searchInput: 150, expectedPdf: 150, expectedPrinted: 491 },
      { searchInput: 200, expectedPdf: 200, expectedPrinted: 541 },
      { searchInput: 354, expectedPdf: 13, expectedPrinted: 354 }, // Start of main text in Part 2
      { searchInput: 355, expectedPdf: 14, expectedPrinted: 355 },
      { searchInput: 360, expectedPdf: 19, expectedPrinted: 360 },
      { searchInput: 391, expectedPdf: 50, expectedPrinted: 391 },
      { searchInput: 400, expectedPdf: 59, expectedPrinted: 400 },
      { searchInput: 441, expectedPdf: 100, expectedPrinted: 441 },
      { searchInput: 450, expectedPdf: 109, expectedPrinted: 450 },
      { searchInput: 491, expectedPdf: 150, expectedPrinted: 491 },
      { searchInput: 500, expectedPdf: 159, expectedPrinted: 500 },
      { searchInput: 541, expectedPdf: 200, expectedPrinted: 541 },
      { searchInput: 550, expectedPdf: 209, expectedPrinted: 550 },
      { searchInput: 600, expectedPdf: 259, expectedPrinted: 600 },
      { searchInput: 650, expectedPdf: 309, expectedPrinted: 650 },
      { searchInput: 700, expectedPdf: 359, expectedPrinted: 700 },
      { searchInput: 715, expectedPdf: 374, expectedPrinted: 715 }, // Last available printed page in Part 2
    ];

    for (const { searchInput, expectedPdf, expectedPrinted } of testCasesPart2) {
      const mappedPdf = getTirmiziPdfPage(2, searchInput);
      expect(mappedPdf).toBe(expectedPdf);
      expect(getTirmiziPrintedPage(2, mappedPdf)).toBe(expectedPrinted);
    }

    // Boundary and front-matter checks for Part 2
    expect(getTirmiziPrintedPage(2, 1)).toBe(1); // Cover
    expect(getTirmiziPrintedPage(2, 2)).toBe(1); // Title page
    expect(getTirmiziPrintedPage(2, 3)).toBe(2);
    expect(getTirmiziPrintedPage(2, 4)).toBe(13); // Start of Fihrist
    expect(getTirmiziPrintedPage(2, 12)).toBe(21); // End of Fihrist
    expect(getTirmiziPrintedPage(2, 13)).toBe(354); // Start of text
    expect(getTirmiziPrintedPage(2, 50)).toBe(391);
    expect(getTirmiziPrintedPage(2, 100)).toBe(441);
    expect(getTirmiziPrintedPage(2, 150)).toBe(491);
    expect(getTirmiziPrintedPage(2, 200)).toBe(541);
    expect(getTirmiziPrintedPage(2, 374)).toBe(715);
    expect(getTirmiziPrintedPage(2, 375)).toBe(715); // Back cover
  });

  it('should verify Volume 1 Part 3 metadata correctly loaded with 297 total pages and 1000 printed pages', () => {
    const vol3 = getTirmiziVolume(3);
    expect(vol3).toBeDefined();
    expect(vol3.volumeNumber).toBe(3);
    expect(vol3.totalPages).toBe(297);
    expect(vol3.totalPrintedPages).toBe(1000);
    expect(vol3.localPdfUrl).toBe('/pdf/jami_at_tirmizi_vol1_part3.pdf');
    expect(vol3.urduTitle).toContain('جامع الترمذی — جلد ۱ (پارٹ ۳)');
    expect(vol3.arabicTitle).toContain('جامع الترمذي — المجلد الأول (الجزء الثالث)');
  });

  it('should verify exact printed book page number mapping for Volume 1 Part 3', () => {
    const testCasesPart3 = [
      { searchInput: 1, expectedPdf: 2, expectedPrinted: 1 },
      { searchInput: 2, expectedPdf: 3, expectedPrinted: 2 },
      { searchInput: 10, expectedPdf: 10, expectedPrinted: 27 },
      { searchInput: 21, expectedPdf: 4, expectedPrinted: 21 }, // Start of Fihrist in Part 3
      { searchInput: 25, expectedPdf: 8, expectedPrinted: 25 },
      { searchInput: 28, expectedPdf: 11, expectedPrinted: 28 }, // End of Fihrist in Part 3
      { searchInput: 50, expectedPdf: 50, expectedPrinted: 754 },
      { searchInput: 100, expectedPdf: 100, expectedPrinted: 804 },
      { searchInput: 150, expectedPdf: 150, expectedPrinted: 854 },
      { searchInput: 200, expectedPdf: 200, expectedPrinted: 904 },
      { searchInput: 297, expectedPdf: 297, expectedPrinted: 1000 },
      { searchInput: 716, expectedPdf: 12, expectedPrinted: 716 }, // Start of main text in Part 3
      { searchInput: 754, expectedPdf: 50, expectedPrinted: 754 },
      { searchInput: 800, expectedPdf: 96, expectedPrinted: 800 },
      { searchInput: 804, expectedPdf: 100, expectedPrinted: 804 },
      { searchInput: 850, expectedPdf: 146, expectedPrinted: 850 },
      { searchInput: 854, expectedPdf: 150, expectedPrinted: 854 },
      { searchInput: 900, expectedPdf: 196, expectedPrinted: 900 },
      { searchInput: 904, expectedPdf: 200, expectedPrinted: 904 },
      { searchInput: 950, expectedPdf: 246, expectedPrinted: 950 },
      { searchInput: 1000, expectedPdf: 296, expectedPrinted: 1000 }, // Last available printed page in Part 3
    ];

    for (const { searchInput, expectedPdf, expectedPrinted } of testCasesPart3) {
      const mappedPdf = getTirmiziPdfPage(3, searchInput);
      expect(mappedPdf).toBe(expectedPdf);
      expect(getTirmiziPrintedPage(3, mappedPdf)).toBe(expectedPrinted);
    }

    // Boundary and front-matter checks for Part 3
    expect(getTirmiziPrintedPage(3, 1)).toBe(1); // Cover
    expect(getTirmiziPrintedPage(3, 2)).toBe(1); // Title page
    expect(getTirmiziPrintedPage(3, 3)).toBe(2);
    expect(getTirmiziPrintedPage(3, 4)).toBe(21); // Start of Fihrist
    expect(getTirmiziPrintedPage(3, 11)).toBe(28); // End of Fihrist
    expect(getTirmiziPrintedPage(3, 12)).toBe(716); // Start of text
    expect(getTirmiziPrintedPage(3, 50)).toBe(754);
    expect(getTirmiziPrintedPage(3, 100)).toBe(804);
    expect(getTirmiziPrintedPage(3, 150)).toBe(854);
    expect(getTirmiziPrintedPage(3, 200)).toBe(904);
    expect(getTirmiziPrintedPage(3, 296)).toBe(1000);
    expect(getTirmiziPrintedPage(3, 297)).toBe(1000); // Back cover
  });

  it('should verify Volume 2 Part 1 (Part 4) metadata correctly loaded with 308 total pages and 310 printed pages', () => {
    const vol4 = getTirmiziVolume(4);
    expect(vol4).toBeDefined();
    expect(vol4.volumeNumber).toBe(4);
    expect(vol4.totalPages).toBe(308);
    expect(vol4.totalPrintedPages).toBe(310);
    expect(vol4.localPdfUrl).toBe('/pdf/jami_at_tirmizi_vol2_part1.pdf');
    expect(vol4.urduTitle).toContain('جامع الترمذی — جلد ۲ (پارٹ ۱)');
    expect(vol4.arabicTitle).toContain('جامع الترمذي — المجلد الثاني (الجزء الأول)');
  });

  it('should verify exact printed book page number mapping for Volume 2 Part 1 (Part 4)', () => {
    const testCasesPart4 = [
      { searchInput: 1, expectedPdf: 2, expectedPrinted: 1 },
      { searchInput: 2, expectedPdf: 3, expectedPrinted: 2 },
      { searchInput: 3, expectedPdf: 4, expectedPrinted: 3 }, // Start of Fihrist in Vol 2
      { searchInput: 5, expectedPdf: 6, expectedPrinted: 5 },
      { searchInput: 8, expectedPdf: 9, expectedPrinted: 8 }, // End of Fihrist in Vol 2
      { searchInput: 10, expectedPdf: 10, expectedPrinted: 13 },
      { searchInput: 13, expectedPdf: 10, expectedPrinted: 13 }, // Start of main text in Vol 2
      { searchInput: 20, expectedPdf: 17, expectedPrinted: 20 },
      { searchInput: 50, expectedPdf: 47, expectedPrinted: 50 },
      { searchInput: 100, expectedPdf: 97, expectedPrinted: 100 },
      { searchInput: 150, expectedPdf: 147, expectedPrinted: 150 },
      { searchInput: 200, expectedPdf: 197, expectedPrinted: 200 },
      { searchInput: 250, expectedPdf: 247, expectedPrinted: 250 },
      { searchInput: 300, expectedPdf: 297, expectedPrinted: 300 },
      { searchInput: 308, expectedPdf: 305, expectedPrinted: 308 },
      { searchInput: 310, expectedPdf: 307, expectedPrinted: 310 }, // Last available printed page in Part 4
    ];

    for (const { searchInput, expectedPdf, expectedPrinted } of testCasesPart4) {
      const mappedPdf = getTirmiziPdfPage(4, searchInput);
      expect(mappedPdf).toBe(expectedPdf);
      expect(getTirmiziPrintedPage(4, mappedPdf)).toBe(expectedPrinted);
    }

    // Boundary and front-matter checks for Part 4
    expect(getTirmiziPrintedPage(4, 1)).toBe(1); // Cover
    expect(getTirmiziPrintedPage(4, 2)).toBe(1); // Title page
    expect(getTirmiziPrintedPage(4, 3)).toBe(2);
    expect(getTirmiziPrintedPage(4, 4)).toBe(3); // Start of Fihrist
    expect(getTirmiziPrintedPage(4, 9)).toBe(8); // End of Fihrist
    expect(getTirmiziPrintedPage(4, 10)).toBe(13); // Start of text
    expect(getTirmiziPrintedPage(4, 47)).toBe(50);
    expect(getTirmiziPrintedPage(4, 97)).toBe(100);
    expect(getTirmiziPrintedPage(4, 147)).toBe(150);
    expect(getTirmiziPrintedPage(4, 197)).toBe(200);
    expect(getTirmiziPrintedPage(4, 307)).toBe(310);
    expect(getTirmiziPrintedPage(4, 308)).toBe(310); // Back cover
  });

  it('should verify Volume 2 Part 2 (Part 5) metadata correctly loaded with 371 total pages and 673 printed pages', () => {
    const vol5 = getTirmiziVolume(5);
    expect(vol5).toBeDefined();
    expect(vol5.volumeNumber).toBe(5);
    expect(vol5.totalPages).toBe(371);
    expect(vol5.totalPrintedPages).toBe(673);
    expect(vol5.localPdfUrl).toBe('/pdf/jami_at_tirmizi_vol2_part2.pdf');
    expect(vol5.urduTitle).toContain('جامع الترمذی — جلد ۲ (پارٹ ۲)');
    expect(vol5.arabicTitle).toContain('جامع الترمذي — المجلد الثاني (الجزء الثاني)');
  });

  it('should verify exact printed book page number mapping for Volume 2 Part 2 (Part 5)', () => {
    const testCasesPart5 = [
      { searchInput: 1, expectedPdf: 2, expectedPrinted: 1 },
      { searchInput: 2, expectedPdf: 3, expectedPrinted: 2 },
      { searchInput: 8, expectedPdf: 4, expectedPrinted: 8 }, // Start of Fihrist in Vol 5
      { searchInput: 10, expectedPdf: 6, expectedPrinted: 10 },
      { searchInput: 11, expectedPdf: 7, expectedPrinted: 11 }, // End of Fihrist in Vol 5
      { searchInput: 50, expectedPdf: 50, expectedPrinted: 353 },
      { searchInput: 100, expectedPdf: 100, expectedPrinted: 403 },
      { searchInput: 200, expectedPdf: 200, expectedPrinted: 503 },
      { searchInput: 300, expectedPdf: 300, expectedPrinted: 603 },
      { searchInput: 311, expectedPdf: 8, expectedPrinted: 311 }, // Start of main text in Part 5
      { searchInput: 350, expectedPdf: 47, expectedPrinted: 350 },
      { searchInput: 400, expectedPdf: 97, expectedPrinted: 400 },
      { searchInput: 500, expectedPdf: 197, expectedPrinted: 500 },
      { searchInput: 600, expectedPdf: 297, expectedPrinted: 600 },
      { searchInput: 673, expectedPdf: 370, expectedPrinted: 673 }, // Last available printed page in Part 5
    ];

    for (const { searchInput, expectedPdf, expectedPrinted } of testCasesPart5) {
      const mappedPdf = getTirmiziPdfPage(5, searchInput);
      expect(mappedPdf).toBe(expectedPdf);
      expect(getTirmiziPrintedPage(5, mappedPdf)).toBe(expectedPrinted);
    }

    // Boundary and front-matter checks for Part 5
    expect(getTirmiziPrintedPage(5, 1)).toBe(1); // Cover
    expect(getTirmiziPrintedPage(5, 2)).toBe(1); // Title page
    expect(getTirmiziPrintedPage(5, 3)).toBe(2);
    expect(getTirmiziPrintedPage(5, 4)).toBe(8); // Start of Fihrist
    expect(getTirmiziPrintedPage(5, 7)).toBe(11); // End of Fihrist
    expect(getTirmiziPrintedPage(5, 8)).toBe(311); // Start of text
    expect(getTirmiziPrintedPage(5, 97)).toBe(400);
    expect(getTirmiziPrintedPage(5, 197)).toBe(500);
    expect(getTirmiziPrintedPage(5, 297)).toBe(600);
    expect(getTirmiziPrintedPage(5, 370)).toBe(673);
    expect(getTirmiziPrintedPage(5, 371)).toBe(673); // Back cover
  });

  it('should verify Volume 2 Part 3 (Part 6) metadata correctly loaded with 157 total pages and 824 printed pages', () => {
    const vol6 = getTirmiziVolume(6);
    expect(vol6).toBeDefined();
    expect(vol6.volumeNumber).toBe(6);
    expect(vol6.totalPages).toBe(157);
    expect(vol6.totalPrintedPages).toBe(824);
    expect(vol6.localPdfUrl).toBe('/pdf/jami_at_tirmizi_vol2_part3.pdf');
    expect(vol6.urduTitle).toContain('جامع الترمذی — جلد ۲ (پارٹ ۳)');
    expect(vol6.arabicTitle).toContain('جامع الترمذي — المجلد الثاني (الجزء الثالث)');
  });

  it('should verify exact printed book page number mapping for Volume 2 Part 3 (Part 6)', () => {
    const testCasesPart6 = [
      { searchInput: 1, expectedPdf: 2, expectedPrinted: 1 },
      { searchInput: 2, expectedPdf: 3, expectedPrinted: 2 },
      { searchInput: 11, expectedPdf: 4, expectedPrinted: 11 }, // Start of Fihrist in Vol 6
      { searchInput: 12, expectedPdf: 5, expectedPrinted: 12 }, // End of Fihrist in Vol 6
      { searchInput: 50, expectedPdf: 50, expectedPrinted: 718 },
      { searchInput: 100, expectedPdf: 100, expectedPrinted: 768 },
      { searchInput: 150, expectedPdf: 150, expectedPrinted: 818 },
      { searchInput: 674, expectedPdf: 6, expectedPrinted: 674 }, // Start of main text in Part 6
      { searchInput: 700, expectedPdf: 32, expectedPrinted: 700 },
      { searchInput: 750, expectedPdf: 82, expectedPrinted: 750 },
      { searchInput: 799, expectedPdf: 131, expectedPrinted: 799 }, // Kitab-ul-Ilal
      { searchInput: 800, expectedPdf: 132, expectedPrinted: 800 },
      { searchInput: 824, expectedPdf: 156, expectedPrinted: 824 }, // Last available printed page in Part 6
    ];

    for (const { searchInput, expectedPdf, expectedPrinted } of testCasesPart6) {
      const mappedPdf = getTirmiziPdfPage(6, searchInput);
      expect(mappedPdf).toBe(expectedPdf);
      expect(getTirmiziPrintedPage(6, mappedPdf)).toBe(expectedPrinted);
    }

    // Boundary and front-matter checks for Part 6
    expect(getTirmiziPrintedPage(6, 1)).toBe(1); // Cover
    expect(getTirmiziPrintedPage(6, 2)).toBe(1); // Title page
    expect(getTirmiziPrintedPage(6, 3)).toBe(2);
    expect(getTirmiziPrintedPage(6, 4)).toBe(11); // Start of Fihrist
    expect(getTirmiziPrintedPage(6, 5)).toBe(12); // End of Fihrist
    expect(getTirmiziPrintedPage(6, 6)).toBe(674); // Start of text
    expect(getTirmiziPrintedPage(6, 32)).toBe(700);
    expect(getTirmiziPrintedPage(6, 82)).toBe(750);
    expect(getTirmiziPrintedPage(6, 131)).toBe(799);
    expect(getTirmiziPrintedPage(6, 132)).toBe(800);
    expect(getTirmiziPrintedPage(6, 156)).toBe(824);
    expect(getTirmiziPrintedPage(6, 157)).toBe(824); // Back cover
  });

  it('should verify TirmiziPdfService has all core high-DPI methods defined and valid image URLs for all 6 Parts', () => {
    expect(typeof TirmiziPdfService.getDocument).toBe('function');
    expect(typeof TirmiziPdfService.getPage).toBe('function');
    expect(typeof TirmiziPdfService.getPageRotation).toBe('function');
    expect(typeof TirmiziPdfService.setPageRotation).toBe('function');
    expect(typeof TirmiziPdfService.renderPageToCanvas).toBe('function');
    expect(typeof TirmiziPdfService.getPageImageUrl).toBe('function');
    expect(typeof TirmiziPdfService.getFallbackPageImageUrl).toBe('function');

    expect(TirmiziPdfService.getPageImageUrl(1, 1)).toBe('/tirmizi/vol1/pages/page_1.webp');
    expect(TirmiziPdfService.getPageImageUrl(6, 1)).toBe('/tirmizi/vol1/pages/page_6.webp');
    expect(TirmiziPdfService.getPageImageUrl(340, 1)).toBe('/tirmizi/vol1/pages/page_340.webp');

    expect(TirmiziPdfService.getPageImageUrl(1, 2)).toBe('/tirmizi/vol2/pages/page_1.webp');
    expect(TirmiziPdfService.getPageImageUrl(13, 2)).toBe('/tirmizi/vol2/pages/page_13.webp');
    expect(TirmiziPdfService.getPageImageUrl(375, 2)).toBe('/tirmizi/vol2/pages/page_375.webp');

    expect(TirmiziPdfService.getPageImageUrl(1, 3)).toBe('/tirmizi/vol3/pages/page_1.webp');
    expect(TirmiziPdfService.getPageImageUrl(12, 3)).toBe('/tirmizi/vol3/pages/page_12.webp');
    expect(TirmiziPdfService.getPageImageUrl(297, 3)).toBe('/tirmizi/vol3/pages/page_297.webp');

    expect(TirmiziPdfService.getPageImageUrl(1, 4)).toBe('/tirmizi/vol4/pages/page_1.webp');
    expect(TirmiziPdfService.getPageImageUrl(10, 4)).toBe('/tirmizi/vol4/pages/page_10.webp');
    expect(TirmiziPdfService.getPageImageUrl(308, 4)).toBe('/tirmizi/vol4/pages/page_308.webp');

    expect(TirmiziPdfService.getPageImageUrl(1, 5)).toBe('/tirmizi/vol5/pages/page_1.webp');
    expect(TirmiziPdfService.getPageImageUrl(8, 5)).toBe('/tirmizi/vol5/pages/page_8.webp');
    expect(TirmiziPdfService.getPageImageUrl(371, 5)).toBe('/tirmizi/vol5/pages/page_371.webp');

    expect(TirmiziPdfService.getPageImageUrl(1, 6)).toBe('/tirmizi/vol6/pages/page_1.webp');
    expect(TirmiziPdfService.getPageImageUrl(6, 6)).toBe('/tirmizi/vol6/pages/page_6.webp');
    expect(TirmiziPdfService.getPageImageUrl(157, 6)).toBe('/tirmizi/vol6/pages/page_157.webp');
  });

  it('should verify TirmiziReader component has vertical reading stream, search container, and correct zoom presets', () => {
    const readerFilePath = path.resolve(__dirname, '../components/library/TirmiziReader.tsx');
    expect(fs.existsSync(readerFilePath)).toBe(true);
    const code = fs.readFileSync(readerFilePath, 'utf8');

    // Vertical stream & page card structure
    expect(code).toContain('tirmizi-vertical-reading-stream');
    expect(code).toContain('tirmizi-page-card');
    expect(code).toContain('tirmizi-page-');
    expect(code).toContain('tirmizi-top-toolbar');
    expect(code).toContain('tirmizi-page-search-container');

    // Page search input & labels
    expect(code).toContain('Page No.');
    expect(code).toContain('directPageInput');
    expect(code).toContain('handleDirectPageSubmit');
    expect(code).toContain('totalPrintedPages');

    // Previous and Next navigation buttons
    expect(code).toContain('handlePrevPage');
    expect(code).toContain('handleNextPage');
    expect(code).toContain('Previous Page');
    expect(code).toContain('Next Page');
    expect(code).toContain('ChevronLeft');
    expect(code).toContain('ChevronRight');

    // Clear validation error handling (no silent wrong redirection)
    expect(code).toContain('validationError');
    expect(code).toContain('setValidationError');
    expect(code).toContain('AlertCircle');

    // Clean zoom controls matching Sahih Muslim (no 180° option in zoom dropdown)
    expect(code).toContain('50%');
    expect(code).toContain('75%');
    expect(code).toContain('100%');
    expect(code).toContain('150%');
    expect(code).toContain('200%');
    expect(code).toContain('Fit to Width');
    expect(code).toContain('Reset to Default');
    expect(code).not.toContain('180°');

    // No Archive.org branding or external viewers or iframes
    expect(code).not.toContain('archive.org');
    expect(code).not.toContain('Internet Archive');
    expect(code).not.toContain('<iframe');
  });

  it('should verify smooth scrolling architecture with zero scroll jumping in TirmiziReader', () => {
    const readerFilePath = path.resolve(__dirname, '../components/library/TirmiziReader.tsx');
    const cssPath = path.resolve(__dirname, '../styles/components.css');
    const code = fs.readFileSync(readerFilePath, 'utf8');
    const css = fs.readFileSync(cssPath, 'utf8');

    // 1. Scroll snap disabled to eliminate upward jumping
    expect(code).toContain("scrollSnapType: 'none'");
    expect(code).toContain("scrollSnapAlign: 'none'");
    expect(css).toContain('.tirmizi-vertical-reading-stream');
    expect(css).toContain('scroll-snap-type: none !important;');
    expect(css).toContain('.tirmizi-page-card');
    expect(css).toContain('scroll-snap-align: none !important;');

    // 2. User interaction listeners for instantaneous programmatic scroll cancellation
    expect(code).toContain("window.addEventListener('wheel'");
    expect(code).toContain("window.addEventListener('touchmove'");
    expect(code).toContain("window.addEventListener('pointerdown'");
    expect(code).toContain("window.addEventListener('keydown'");

    // 3. Silent history synchronization during scroll without React Router re-renders
    expect(code).toContain('window.history.replaceState');

    // 4. Stable card borders and aspect ratios preventing cumulative layout shifts
    expect(code).toContain("border: isCurrent\n            ? '2px solid #c026d3'\n            : '2px solid var(--border-default)'");
    expect(code).toContain("aspectRatio: '700 / 1020'");
  });

  it('should verify BookReaderPage routes Jami’ at-Tirmidhi to TirmiziReader', () => {
    const readerPagePath = path.resolve(__dirname, '../pages/Library/BookReaderPage.tsx');
    const code = fs.readFileSync(readerPagePath, 'utf8');
    expect(code).toContain('TirmiziReader');
    expect(code).toContain("bookId === 'jami-at-tirmidhi'");
  });

  it('should verify BookDetailPage renders Jami’ at-Tirmidhi volume selection view with clean cards', () => {
    const detailPagePath = path.resolve(__dirname, '../pages/Library/BookDetailPage.tsx');
    const code = fs.readFileSync(detailPagePath, 'utf8');
    expect(code).toContain("book.id === 'jami-at-tirmidhi'");
    expect(code).toContain('tirmizi-cards-row');
    expect(code).toContain('tirmizi-book-card');
    expect(code).toContain('TirmiziSelectionCoverCanvas');
    expect(code).not.toContain('archive.org');
  });
});
