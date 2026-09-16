import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.resolve(__dirname, '../public/pdf/jami_at_tirmizi_vol1_part1.pdf');
  const wasmDir = path.resolve(__dirname, '../public/wasm') + '/';

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    wasmUrl: wasmDir,
    cMapUrl: path.resolve(__dirname, '../public/cmaps') + '/',
    standardFontDataUrl: path.resolve(__dirname, '../public/standard_fonts') + '/',
  }).promise;

  console.log(`Document loaded: ${doc.numPages} pages.`);

  // Let's inspect the text/header content across various pages
  const checkPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 320, 330, 335, 338, 339, 340];

  for (const pageNum of checkPages) {
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const strings = textContent.items.map(it => it.str).filter(s => s.trim().length > 0);
    console.log(`\n=== PDF PAGE ${pageNum} ===`);
    console.log(`Found ${strings.length} text items:`, strings.slice(0, 10));
  }
}

main().catch(console.error);
