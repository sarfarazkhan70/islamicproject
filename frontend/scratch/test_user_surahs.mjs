import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const testSurahs = [
  { number: 1, name: 'Al-Fatihah', pageStart: 3 },
  { number: 2, name: 'Al-Baqarah', pageStart: 4 },
  { number: 3, name: "Ali 'Imran (Aal-e-Imran)", pageStart: 92 },
  { number: 18, name: 'Al-Kahf', pageStart: 543 },
  { number: 36, name: 'Ya-Sin', pageStart: 814 },
  { number: 55, name: 'Ar-Rahman', pageStart: 982 },
  { number: 67, name: 'Al-Mulk', pageStart: 1044 },
  { number: 114, name: 'An-Nas', pageStart: 1123 }
];

async function testTargetPages() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  console.log('Testing specific user-requested Surahs:');
  for (const s of testSurahs) {
    const page = await doc.getPage(s.pageStart);
    console.log(`Surah ${s.number} (${s.name}) -> Page ${s.pageStart} rendered successfully: ${page !== null}`);
  }
}

testTargetPages().catch(console.error);
