import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

async function checkTargets() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const cleanSurahs = JSON.parse(fs.readFileSync('scratch/clean_surahs.json', 'utf8'));

  const targets = [
    { num: 1, name: 'Al-Fatihah' },
    { num: 2, name: 'Al-Baqarah' },
    { num: 3, name: 'Aal-e-Imran' },
    { num: 18, name: 'Al-Kahf' },
    { num: 36, name: 'Ya-Sin' },
    { num: 55, name: 'Ar-Rahman' },
    { num: 67, name: 'Al-Mulk' },
    { num: 114, name: 'An-Nas' }
  ];

  for (const t of targets) {
    const s = cleanSurahs.find(x => x.number === t.num);
    console.log(`Surah ${s.number} (${s.name}): pageStart in clean_surahs.json = ${s.pageStart}`);
  }
}

checkTargets().catch(console.error);
