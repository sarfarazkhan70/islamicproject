import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

async function analyzePages() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  console.log(`Analyzing ${doc.numPages} pages...`);

  // Let's create a directory for headers
  const headerDir = path.resolve('headers_sample');
  if (!fs.existsSync(headerDir)) fs.mkdirSync(headerDir, { recursive: true });

  // Let's check every 10th page and specific pages to find Para boundaries
  // Each Para in 1092-page Quran is roughly 36-38 pages.
  // Let's check pages around estimated Para start locations:
  // Para 1: page 3
  // Para 2: ~page 39
  // Para 3: ~page 75
  // Para 4: ~page 112
  // etc.
  
  // Let's extract top 80px of pages 3..1124 in batches or search for Surah headings!
  // Surah headings have a distinctive decorative box with "سورة ..." and "آياتها ... ركوعاتها"
}

analyzePages().catch(err => console.error(err));
