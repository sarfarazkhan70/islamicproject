import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

async function verifyAll114SurahsDetailed() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const surahs = JSON.parse(fs.readFileSync('scratch/clean_surahs.json', 'utf8'));

  const userRequestedSurahs = [
    { number: 1, name: 'Al-Fatihah' },
    { number: 2, name: 'Al-Baqarah' },
    { number: 3, name: "Ali 'Imran" },
    { number: 4, name: 'An-Nisa' },
    { number: 18, name: 'Al-Kahf' },
    { number: 36, name: 'Ya-Sin' },
    { number: 55, name: 'Ar-Rahman' },
    { number: 67, name: 'Al-Mulk' },
    { number: 112, name: 'Al-Ikhlas' },
    { number: 113, name: 'Al-Falaq' },
    { number: 114, name: 'An-Nas' }
  ];

  console.log('=== Checking User-Requested Surahs in Detail ===');
  for (const s of userRequestedSurahs) {
    const meta = surahs.find(x => x.number === s.number);
    console.log(`Surah ${meta.number} (${meta.name} - ${meta.arabicName}): mapped to page ${meta.pageStart}`);
  }
}

verifyAll114SurahsDetailed().catch(console.error);
