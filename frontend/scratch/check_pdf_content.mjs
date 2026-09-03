import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

async function checkPdfContent() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  console.log('Total PDF Pages:', doc.numPages);

  // Check text content on a sample of pages
  let hasText = false;
  for (let p = 1; p <= 10; p++) {
    const page = await doc.getPage(p);
    const textContent = await page.getTextContent();
    if (textContent.items.length > 0) {
      hasText = true;
      console.log(`Page ${p} has text items:`, textContent.items.length);
    }
  }
  console.log('PDF has extractable text items:', hasText);
}

checkPdfContent().catch(console.error);
