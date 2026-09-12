import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectUrduPageHeaders() {
  const urduPdfPath = path.resolve(__dirname, '../public/pdf/hadaiq_e_bakhshish.pdf');
  const urduDoc = await pdfjsLib.getDocument({ url: urduPdfPath }).promise;
  console.log('--- Inspecting Urdu PDF Page Headers & Numbering ---');

  for (let p = 1; p <= 30; p++) {
    const page = await urduDoc.getPage(p);
    const text = await page.getTextContent();
    const items = text.items.map(i => ({
      str: i.str.trim(),
      x: Math.round(i.transform[4]),
      y: Math.round(i.transform[5]),
    })).filter(i => i.str.length > 0);

    // Look for numbers in items
    const numberItems = items.filter(i => /^[0-9\u0660-\u0669\u06F0-\u06F9]+$/.test(i.str));
    console.log(`PDF Page ${p}: items=${items.length}, numbers=[${numberItems.map(n => `"${n.str}" at (${n.x},${n.y})`).join(', ')}]`);
  }

  // Check pages 50, 78, 100, 159, 200, 279, 302, 444, 454
  for (const p of [50, 78, 100, 159, 200, 279, 302, 444, 450, 454]) {
    const page = await urduDoc.getPage(p);
    const text = await page.getTextContent();
    const items = text.items.map(i => ({
      str: i.str.trim(),
      x: Math.round(i.transform[4]),
      y: Math.round(i.transform[5]),
    })).filter(i => i.str.length > 0);
    const numberItems = items.filter(i => /^[0-9\u0660-\u0669\u06F0-\u06F9]+$/.test(i.str));
    console.log(`PDF Page ${p}: items=${items.length}, numbers=[${numberItems.map(n => `"${n.str}" at (${n.x},${n.y})`).join(', ')}]`);
  }
}

inspectUrduPageHeaders();
