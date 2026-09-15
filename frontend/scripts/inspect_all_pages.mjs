import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectAllPages() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.resolve(__dirname, '../public/pdf/sahih_muslim_vol1.pdf');
  const scratchDir = 'C:/Users/USER/.gemini/antigravity-ide/brain/28908bcb-6f74-44ee-82d0-ffbe955075b0/scratch';

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    wasmUrl: path.resolve(__dirname, '../public/wasm') + '/',
    cMapUrl: path.resolve(__dirname, '../public/cmaps') + '/',
    standardFontDataUrl: path.resolve(__dirname, '../public/standard_fonts') + '/',
  }).promise;

  const totalPages = doc.numPages;
  console.log(`Total pages: ${totalPages}`);

  const pageInfo = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    const textItems = tc.items.map((item) => ({
      str: item.str,
      transform: item.transform,
      x: item.transform[4],
      y: item.transform[5],
      fontHeight: item.transform[3],
    }));

    // Check operator list / images
    const ops = await page.getOperatorList();
    
    pageInfo.push({
      pageNumber: i,
      rotate: page.rotate,
      view: page.view,
      textCount: tc.items.length,
      textItems,
    });
  }

  fs.writeFileSync(path.join(scratchDir, 'all_pages_info.json'), JSON.stringify(pageInfo, null, 2));
  console.log('Saved all_pages_info.json');
}

inspectAllPages().catch(console.error);
