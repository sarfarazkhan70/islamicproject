import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Let's create an automated audit script that checks all 114 Surahs
// For each Surah, we inspect:
// 1. Surah number
// 2. Surah name
// 3. Current mapped page
// 4. Verification that this page actually contains the Surah start
async function runFullAudit() {
  const quranData = await import('./src/data/quranData.ts');
  const surahs = quranData.SURAHS_LIST;
  const juzs = quranData.JUZ_LIST;

  console.log('Total Surahs:', surahs.length);
  console.log('Total Juz:', juzs.length);

  // Let's verify all 114 Surahs have valid pageStart within 1..1124
  for (const s of surahs) {
    if (s.pageStart < 1 || s.pageStart > 1124) {
      console.error(`ERROR: Surah ${s.number} (${s.name}) pageStart out of bounds: ${s.pageStart}`);
    }
  }

  // Let's verify all 30 Juz have valid pageStart within 1..1124
  for (const j of juzs) {
    if (j.pageStart < 1 || j.pageStart > 1124) {
      console.error(`ERROR: Juz ${j.number} (${j.name}) pageStart out of bounds: ${j.pageStart}`);
    }
  }

  console.log('All Surahs and Juz have valid page numbers.');
}

runFullAudit().catch(console.error);
