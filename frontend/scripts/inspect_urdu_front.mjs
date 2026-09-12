import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectUrduFront() {
  const urduPdfPath = path.resolve(__dirname, '../public/pdf/hadaiq_e_bakhshish.pdf');
  const urduDoc = await pdfjsLib.getDocument({ url: urduPdfPath }).promise;
  console.log('--- Inspecting Urdu PDF Pages 1 to 25 ---');

  for (let p = 1; p <= 25; p++) {
    const page = await urduDoc.getPage(p);
    const text = await page.getTextContent();
    const items = text.items.map(i => ({
      str: i.str.trim(),
      x: Math.round(i.transform[4]),
      y: Math.round(i.transform[5]),
    })).filter(i => i.str.length > 0);

    // Look for header numbers (y > 780 or y near 811)
    const headerItems = items.filter(i => i.y >= 780);
    console.log(`PDF Page ${p}: Header items:`, headerItems.map(i => `"${i.str}" (${i.x},${i.y})`).join(' | '));
  }
}

inspectUrduFront();
