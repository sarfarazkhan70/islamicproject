import { describe, it, expect } from 'vitest';
import {
  FATAWA_RAZAWIYYA_VOLUMES,
  getFatawaVolume,
  getFatawaVolumeByIndex,
  getFatawaPdfPage,
  getFatawaPrintedPage,
} from '../data/fatawaRazawiyyaData';
import { FatawaRazawiyyaPdfService } from '../services/fatawaRazawiyyaPdfService';
import { getBookById, getBookVolumes } from '../data/libraryData';

describe('Fatawa-e-Razviya Jild 1.1 Architecture & Reading Experience', () => {
  it('1. Jild 1.1 has verified 591 total scanned pages and 588 printed pages', () => {
    const vol1_1 = getFatawaVolume('1.1');
    expect(vol1_1).toBeDefined();
    expect(vol1_1.volumeKey).toBe('1.1');
    expect(vol1_1.title).toBe('Fatawa-e-Razviya – Jild 1.1');
    expect(vol1_1.totalPages).toBe(591);
    expect(vol1_1.totalPrintedPages).toBe(588);
    expect(vol1_1.localPdfUrl).toBe('/pdf/fatawa/fatawa_razawiyya_vol_1_1.pdf');
  });

  it('2. Volume metadata helper functions resolve Jild 1.1 properly', () => {
    expect(getFatawaVolume('1.1').volumeKey).toBe('1.1');
    expect(getFatawaVolume('vol-1-1').volumeKey).toBe('1.1');
    expect(getFatawaVolume('jild-1.1').volumeKey).toBe('1.1');
    expect(getFatawaVolumeByIndex(1).volumeKey).toBe('1.1');
  });

  it('3. Accurate printed page to PDF scan page mapping for Jild 1.1', () => {
    // First printed page (Page 1) maps to PDF Scan Page 4
    expect(getFatawaPdfPage('1.1', 1)).toBe(4);
    expect(getFatawaPrintedPage('1.1', 4)).toBe(1);

    // Front-matter (PDF Pages 1, 2, 3) safely maps to Printed Page 1
    expect(getFatawaPrintedPage('1.1', 1)).toBe(1);
    expect(getFatawaPrintedPage('1.1', 2)).toBe(1);
    expect(getFatawaPrintedPage('1.1', 3)).toBe(1);

    // Middle & Random page tests
    // Printed Page 50 -> PDF Page 53
    expect(getFatawaPdfPage('1.1', 50)).toBe(53);
    expect(getFatawaPrintedPage('1.1', 53)).toBe(50);

    // Printed Page 100 -> PDF Page 103
    expect(getFatawaPdfPage('1.1', 100)).toBe(103);
    expect(getFatawaPrintedPage('1.1', 103)).toBe(100);

    // Printed Page 300 -> PDF Page 303
    expect(getFatawaPdfPage('1.1', 300)).toBe(303);
    expect(getFatawaPrintedPage('1.1', 303)).toBe(300);

    // Last printed page (Page 588) maps to last PDF Scan Page (Page 591)
    expect(getFatawaPdfPage('1.1', 588)).toBe(591);
    expect(getFatawaPrintedPage('1.1', 591)).toBe(588);
  });

  it('4. FatawaRazawiyyaPdfService generates valid local WebP image URLs', () => {
    const urlFirst = FatawaRazawiyyaPdfService.getPageImageUrl(1, '1.1');
    expect(urlFirst).toBe('/fatawa/vol_1_1/pages/page_1.webp');

    const urlMiddle = FatawaRazawiyyaPdfService.getPageImageUrl(300, '1.1');
    expect(urlMiddle).toBe('/fatawa/vol_1_1/pages/page_300.webp');

    const urlLast = FatawaRazawiyyaPdfService.getPageImageUrl(591, '1.1');
    expect(urlLast).toBe('/fatawa/vol_1_1/pages/page_591.webp');

    // Test rotation setter
    FatawaRazawiyyaPdfService.setPageRotation(1, 90, '1.1');
  });

  it('5. Library catalog card configuration for Fatawa-e-Razviya (31 Volumes)', () => {
    const book = getBookById('fatawa-razawiyya');
    expect(book).toBeDefined();
    expect(book?.title).toBe('Fatawa-e-Razviya');
    expect(book?.author).toContain('Ahmad Raza');
    expect(book?.category).toBe('fatawa');
    expect(book?.volumeCount).toBe(31);

    const volumes = getBookVolumes(book!);
    expect(volumes.length).toBe(31);
    expect(volumes[0].title).toBe('Fatawa-e-Razviya – Jild 1.1');
    expect(volumes[1].title).toBe('Fatawa-e-Razviya – Jild 1.2');
    expect(volumes[0].isAvailable).toBe(true);

    expect(FATAWA_RAZAWIYYA_VOLUMES.length).toBe(31);
    expect(FatawaRazawiyyaPdfService.getCoverImageUrl('1.1')).toBe('/fatawa/covers/cover_1_1.webp');
    expect(FatawaRazawiyyaPdfService.getCoverImageUrl('30')).toBe('/fatawa/covers/cover_30.webp');
  });
});
