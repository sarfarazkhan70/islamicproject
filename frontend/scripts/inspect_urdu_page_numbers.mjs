import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectUrduPageNumbers() {
  const urduPdfPath = path.resolve(__dirname, '../public/pdf/hadaiq_e_bakhshish.pdf');
  const urduDoc = await pdfjsLib.getDocument({ url: urduPdfPath }).promise;
  console.log('--- Analyzing Urdu PDF Page Numbers ---');

  for (let p = 1; p <= 35; p++) {
    const page = await urduDoc.getPage(p);
    const text = await page.getTextContent();
    // Sort items by vertical position y (descending = top to bottom)
    const items = text.items.map(i => ({
      str: i.str,
      x: Math.round(i.transform[4]),
      y: Math.round(i.transform[5]),
    }));

    // Find top-most items (header) and bottom-most items (footer)
    items.sort((a, b) => b.y - a.y);
    const topItems = items.slice(0, 5).map(i => `"${i.str}" (${i.x},${i.y})`).join(' | ');
    const bottomItems = items.slice(-5).map(i => `"${i.str}" (${i.x},${i.y})`).join(' | ');

    console.log(`PDF Page ${p} (h=${page.view[3]}): TOP: [${topItems}] --- BOTTOM: [${bottomItems}]`);
  }

  for (const p of [78, 100, 159, 200, 279, 302, 444, 450, 454]) {
    const page = await urduDoc.getPage(p);
    const text = await page.getTextContent();
    const items = text.items.map(i => ({
      str: i.str,
      x: Math.round(i.transform[4]),
      y: Math.round(i.transform[5]),
    }));
    items.sort((a, b) => b.y - a.y);
    const topItems = items.slice(0, 5).map(i => `"${i.str}" (${i.x},${i.y})`).join(' | ');
    const bottomItems = items.slice(-5).map(i => `"${i.str}" (${i.x},${i.y})`).join(' | ');
    console.log(`PDF Page ${p}: TOP: [${topItems}] --- BOTTOM: [${bottomItems}]`);
  }
}

inspectUrduPageNumbers();
