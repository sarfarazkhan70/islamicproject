import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectDetailed() {
  const urduPdfPath = path.resolve(__dirname, '../public/pdf/hadaiq_e_bakhshish.pdf');
  const urduDoc = await pdfjsLib.getDocument({ url: urduPdfPath }).promise;
  console.log('--- URDU PDF (454 pages) ---');
  
  // Let's check pages 1..25
  for (let p = 1; p <= 25; p++) {
    const page = await urduDoc.getPage(p);
    const text = await page.getTextContent();
    const str = text.items.map(i => i.str).join(' ');
    console.log(`PDF Page ${p}: items=${text.items.length}, textSample="${str.slice(0, 100)}..."`);
  }

  // Check some more pages
  for (const p of [30, 50, 78, 100, 159, 200, 279, 300, 302, 400, 440, 444, 450, 454]) {
    const page = await urduDoc.getPage(p);
    const text = await page.getTextContent();
    const str = text.items.map(i => i.str).join(' ');
    console.log(`PDF Page ${p}: items=${text.items.length}, textSample="${str.slice(0, 100)}..."`);
  }

  const hindiPdfPath = path.resolve(__dirname, '../public/pdf/hadaiq_e_bakhshish_hindi.pdf');
  const hindiDoc = await pdfjsLib.getDocument({ url: hindiPdfPath }).promise;
  console.log('\n--- HINDI PDF (498 pages) ---');
  for (let p = 480; p <= 498; p++) {
    const page = await hindiDoc.getPage(p);
    const text = await page.getTextContent();
    const str = text.items.map(i => i.str).join(' ');
    console.log(`Hindi PDF Page ${p}: items=${text.items.length}, textSample="${str.slice(0, 80)}..."`);
  }
}

inspectDetailed();
