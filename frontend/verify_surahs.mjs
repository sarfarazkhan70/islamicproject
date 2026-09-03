import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

// Let's verify each Surah's header image directly
async function verifyAllSurahs() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  // We can write a complete mapping table
  console.log(`Document loaded: ${doc.numPages} pages.`);
}

verifyAllSurahs().catch(console.error);
