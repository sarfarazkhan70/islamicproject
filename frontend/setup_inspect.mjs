import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Let's create an automated script that extracts header crops of suspect pages and builds an HTML visual index
// to check the exact page of every Surah in quran.pdf
async function inspectAllSurahStarts() {
  const pdfPath = path.resolve('public/quran/quran.pdf');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const outDir = path.resolve('all_surah_headers_full');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('Document loaded, pages:', doc.numPages);
}

inspectAllSurahStarts().catch(console.error);
