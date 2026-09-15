import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjs from '../node_modules/pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfPath = path.join(__dirname, '../public/pdf/sahih_muslim_vol1.pdf');
const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjs.getDocument({
  data,
  standardFontDataUrl: 'C:/IslamicPrayer/frontend/node_modules/pdfjs-dist/standard_fonts/',
  cMapUrl: 'C:/IslamicPrayer/frontend/node_modules/pdfjs-dist/cmaps/',
  cMapPacked: true,
}).promise;

console.log(`Analyzing all ${doc.numPages} rendered pages at rotation 0...`);

const invertedPages = [];
const uprightPages = [];
const nonStandardPages = [];

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const viewport0 = page.getViewport({ scale: 0.5, rotation: 0 });
  const w = Math.floor(viewport0.width);
  const h = Math.floor(viewport0.height);
  const canvas0 = createCanvas(w, h);
  const ctx0 = canvas0.getContext('2d');
  ctx0.fillStyle = '#ffffff';
  ctx0.fillRect(0, 0, w, h);
  await page.render({
    canvasContext: ctx0,
    viewport: viewport0,
  }).promise;

  const imgData = ctx0.getImageData(0, 0, w, h);
  const pixels = imgData.data;

  // Let's check the distribution of dark pixels (black/gray text and lines)
  // Top region: y from 0 to 0.15 * h
  // Bottom region: y from 0.85 * h to h
  // Specifically, standard book pages have a solid horizontal header rule / banner across the top (top 15%),
  // and page number oval near bottom.
  // If inverted, the solid horizontal header banner is in the bottom 15%!
  let topDark = 0;
  let bottomDark = 0;
  let maxTopRowDark = 0;
  let maxBottomRowDark = 0;

  for (let y = 0; y < Math.floor(h * 0.15); y++) {
    let rowDark = 0;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const lum = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
      if (lum < 150) {
        rowDark++;
        topDark++;
      }
    }
    if (rowDark > maxTopRowDark) maxTopRowDark = rowDark;
  }

  for (let y = Math.floor(h * 0.85); y < h; y++) {
    let rowDark = 0;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const lum = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
      if (lum < 150) {
        rowDark++;
        bottomDark++;
      }
    }
    if (rowDark > maxBottomRowDark) maxBottomRowDark = rowDark;
  }

  // Cover / title pages might not have standard header banner
  const isHeaderAtTop = maxTopRowDark > w * 0.45;
  const isHeaderAtBottom = maxBottomRowDark > w * 0.45;

  if (isHeaderAtBottom && !isHeaderAtTop) {
    invertedPages.push({ p, maxTopRowDark, maxBottomRowDark, topDark, bottomDark });
  } else if (isHeaderAtTop) {
    uprightPages.push(p);
  } else {
    nonStandardPages.push({ p, maxTopRowDark, maxBottomRowDark, topDark, bottomDark });
  }
}

console.log(`Scan complete!`);
console.log(`Standard Upright Pages (${uprightPages.length})`);
console.log(`Inverted Pages (${invertedPages.length}):`, invertedPages);
console.log(`Non-standard / Title Pages (${nonStandardPages.length}):`, nonStandardPages);
