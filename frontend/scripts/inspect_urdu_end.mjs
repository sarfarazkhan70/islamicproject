import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectUrduEnd() {
  const urduPdfPath = path.resolve(__dirname, '../public/pdf/hadaiq_e_bakhshish.pdf');
  const urduDoc = await pdfjsLib.getDocument({ url: urduPdfPath }).promise;
  for (let p = 445; p <= 454; p++) {
    const page = await urduDoc.getPage(p);
    const text = await page.getTextContent();
    const items = text.items.map(i => ({
      str: i.str.trim(),
      x: Math.round(i.transform[4]),
      y: Math.round(i.transform[5]),
    })).filter(i => i.str.length > 0);
    const nums = items.filter(i => /^[0-9]+$/.test(i.str) && i.y >= 780);
    console.log(`PDF Page ${p}: items=${items.length}, headerNums=${nums.map(n => n.str).join(',')}`);
  }
}

inspectUrduEnd();
