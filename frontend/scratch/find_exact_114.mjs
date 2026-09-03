import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Let's inspect pages from 900 to 1124 to get the exact start page for every Surah in that range
async function getSurahStarts() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const rawBanners = JSON.parse(fs.readFileSync('scratch/detected_raw_banners.json', 'utf8')).map(b => b.page);
  const uniquePages = Array.from(new Set(rawBanners)).sort((a,b) => a - b);
  console.log('Total unique candidate banner pages:', uniquePages.length);
  console.log(JSON.stringify(uniquePages));
}

getSurahStarts().catch(console.error);
