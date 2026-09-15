import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MuslimPdfService } from '../services/muslimPdfService';
import { LOCAL_MUSLIM_VOL1_PDF_PATH, getMuslimVolume } from '../data/muslimData';

describe('Sahih Muslim Experience & Multi-Volume Reader Verification', () => {
  it('should load volume 1 metadata correctly with 453 pages', () => {
    const vol1 = getMuslimVolume(1);
    expect(vol1.totalPages).toBe(453);
    expect(vol1.localPdfUrl).toBe(LOCAL_MUSLIM_VOL1_PDF_PATH);
  });

  it('should load volume 2 metadata correctly with 425 pages', () => {
    const vol2 = getMuslimVolume(2);
    expect(vol2.totalPages).toBe(425);
    expect(vol2.localPdfUrl).toBe('/pdf/sahih_muslim_vol2.pdf');
  });

  it('should load volume 3 metadata correctly with 397 pages', () => {
    const vol3 = getMuslimVolume(3);
    expect(vol3.totalPages).toBe(397);
    expect(vol3.totalPrintedPages).toBe(396);
    expect(vol3.localPdfUrl).toBe('/pdf/sahih_muslim_vol3.pdf');
  });

  it('should load volume 4 metadata correctly with 354 pages', () => {
    const vol4 = getMuslimVolume(4);
    expect(vol4.totalPages).toBe(354);
    expect(vol4.totalPrintedPages).toBe(352);
    expect(vol4.localPdfUrl).toBe('/pdf/sahih_muslim_vol4.pdf');
  });

  it('should load volume 5 metadata correctly with 408 pages', () => {
    const vol5 = getMuslimVolume(5);
    expect(vol5.totalPages).toBe(408);
    expect(vol5.totalPrintedPages).toBe(408);
    expect(vol5.localPdfUrl).toBe('/pdf/sahih_muslim_vol5.pdf');
  });

  it('should load volume 6 metadata correctly with 520 pages', () => {
    const vol6 = getMuslimVolume(6);
    expect(vol6.totalPages).toBe(520);
    expect(vol6.totalPrintedPages).toBe(518);
    expect(vol6.localPdfUrl).toBe('/pdf/sahih_muslim_vol6.pdf');
  });

  it('should verify MuslimPdfService has core methods defined', () => {
    expect(typeof MuslimPdfService.getDocument).toBe('function');
    expect(typeof MuslimPdfService.getPage).toBe('function');
    expect(typeof MuslimPdfService.getPageRotation).toBe('function');
    expect(typeof MuslimPdfService.setPageRotation).toBe('function');
    expect(typeof MuslimPdfService.renderPageToCanvas).toBe('function');
    expect(typeof MuslimPdfService.getPageImageUrl).toBe('function');
  });

  it('should verify MuslimReader component structure retains all required features without extra headers or 180° option', () => {
    const readerFile = path.resolve(__dirname, '../components/library/MuslimReader.tsx');
    const content = fs.readFileSync(readerFile, 'utf-8');

    // Clean layout - no extra unneeded top title section or "النسخة الكاملة"
    expect(content).not.toContain('النسخة الكاملة');

    // Navigation and book layout
    expect(content).toContain('totalPages');
    expect(content).toContain('muslim-page-search-container');
    expect(content).toContain('muslim-vertical-reading-stream');
    expect(content).toContain('muslim-page-card');

    // Zoom controls - clean without 180° rotation
    expect(content).toContain('Zoom');
    expect(content).toContain('Fit to Width');
    expect(content).not.toContain('180°');

    // No external Archive.org viewers or iframes
    expect(content).not.toContain('archive.org/stream');
    expect(content).not.toContain('<iframe');
  });
});
