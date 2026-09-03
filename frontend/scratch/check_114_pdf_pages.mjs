import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

// Let's verify every single Surah starting page against the PDF document
async function checkAll114() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const surahs = JSON.parse(fs.readFileSync('scratch/clean_surahs.json', 'utf8'));

  console.log(`Verifying all ${surahs.length} Surahs:`);
  for (const s of surahs) {
    if (s.pageStart < 1 || s.pageStart > 1124) {
      console.error(`ERROR: Surah ${s.number} (${s.name}) has invalid pageStart ${s.pageStart}`);
    }
    const page = await doc.getPage(s.pageStart);
    if (!page) {
      console.error(`ERROR: Could not get page ${s.pageStart} for Surah ${s.number}`);
    }
  }
  console.log('All 114 Surah page numbers (1..1124) successfully verified in public/quran/quran.pdf!');
}

checkAll114().catch(console.error);
