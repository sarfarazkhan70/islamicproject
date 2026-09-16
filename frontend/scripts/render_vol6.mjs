import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';

const pdfPath = path.resolve('public/pdf/jami_at_tirmizi_vol2_part3.pdf');
const outPagesDir = path.resolve('public/tirmizi/vol6/pages');
const outCoverPath = path.resolve('public/tirmizi/vol6/cover.webp');
const montageDir = path.resolve('scripts/p6_montages');

fs.mkdirSync(outPagesDir, { recursive: true });
fs.mkdirSync(montageDir, { recursive: true });

async function renderAll() {
  console.log('Loading PDF from:', pdfPath);
  const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({
    data: pdfData,
  }).promise;

  const numPages = doc.numPages;
  console.log(`Total PDF Pages: ${numPages}`);

  const scale = 1.5; // High-DPI crisp rendering

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    // Save as WebP
    const webpBuffer = await canvas.encode('webp', 85);
    const pageOutFile = path.join(outPagesDir, `page_${pageNum}.webp`);
    fs.writeFileSync(pageOutFile, webpBuffer);

    if (pageNum === 1) {
      fs.writeFileSync(outCoverPath, webpBuffer);
    }

    if (pageNum % 25 === 0 || pageNum === numPages) {
      console.log(`Rendered page ${pageNum}/${numPages}`);
    }
  }

  console.log('All WebP pages rendered successfully!');
}

renderAll().catch(err => {
  console.error('Error during rendering:', err);
  process.exit(1);
});
