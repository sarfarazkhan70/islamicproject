import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Let's create an automated script that scans all pages to extract exact Surah headers
// and maps all 114 Surahs from the PDF pages
async function checkAllSurahs() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  // Let's verify all Juz start pages
  // Green covers at: [1, 40, 77, 114, 151, 188, 225, 262, 299, 336, 373, 410, 447, 484, 521, 558, 595, 632, 669, 706, 743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084]
  // Juz 1: 3
  // Juz 2: 41
  // Juz 3: 78
  // Juz 4: 115
  // Juz 5: 152
  // Juz 6: 189
  // Juz 7: 226
  // Juz 8: 263
  // Juz 9: 300
  // Juz 10: 337
  // Juz 11: 374
  // Juz 12: 411
  // Juz 13: 448
  // Juz 14: 485
  // Juz 15: 522
  // Juz 16: 559
  // Juz 17: 596
  // Juz 18: 633
  // Juz 19: 670
  // Juz 20: 707
  // Juz 21: 744
  // Juz 22: 781
  // Juz 23: 818
  // Juz 24: 855
  // Juz 25: 892
  // Juz 26: 929
  // Juz 27: 966
  // Juz 28: 1003
  // Juz 29: 1044
  // Juz 30: 1085

  console.log('PDF loaded, total pages:', doc.numPages);
}

checkAllSurahs().catch(console.error);
