import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const pdfPath = path.resolve(__dirname, '../public/pdf/jami_at_tirmizi_vol1_part1.pdf');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({
    data,
    cMapUrl: path.resolve(__dirname, '../public/cmaps') + '/',
    standardFontDataUrl: path.resolve(__dirname, '../public/standard_fonts') + '/',
  }).promise;

  const totalPages = doc.numPages;
  console.log(`Tirmizi Vol 1 Part 1 Total Pages: ${totalPages}`);

  // Create a debug directory to save first 10, middle 10, and last 10 page previews if needed
  const debugDir = path.resolve(__dirname, 'debug_tirmizi');
  if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });

  const pageReports = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const rotate = page.rotate || 0;
    const view = page.view; // [x, y, width, height]
    const width = view[2] - view[0];
    const height = view[3] - view[1];

    pageReports.push({
      pageNum,
      rotate,
      width,
      height,
      aspectRatio: (width / height).toFixed(3),
    });
  }

  console.log('Page aspect ratios and rotations check:');
  const nonZeroRotations = pageReports.filter(p => p.rotate !== 0);
  console.log('Non-zero rotations:', nonZeroRotations.length);

  const oddDimensions = pageReports.filter(p => Math.abs(p.width - pageReports[0].width) > 50 || Math.abs(p.height - pageReports[0].height) > 50);
  console.log('Odd dimensions count:', oddDimensions.length);
  if (oddDimensions.length > 0) {
    console.log('Odd dimensions:', oddDimensions.slice(0, 10));
  }

  // Let's render first 15 pages and save as PNG in debug_tirmizi to visually verify the start
  for (let pageNum = 1; pageNum <= 15; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    fs.writeFileSync(path.join(debugDir, `page_${pageNum}.png`), canvas.toBuffer('image/png'));
  }

  // Render pages around 320-340 to inspect the end
  for (let pageNum = 320; pageNum <= totalPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    fs.writeFileSync(path.join(debugDir, `page_${pageNum}.png`), canvas.toBuffer('image/png'));
  }

  console.log('Saved debug images for inspection in scripts/debug_tirmizi');
}

main().catch(console.error);
