import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateRemaining() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.resolve(__dirname, '../public/pdf/bukhari_shareef_drive.pdf');
  const wasmDir = path.resolve(__dirname, '../public/wasm') + '/';
  const outDir = path.resolve(__dirname, '../public/bukhari/pages');

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    wasmUrl: wasmDir,
    cMapUrl: path.resolve(__dirname, '../public/cmaps') + '/',
    standardFontDataUrl: path.resolve(__dirname, '../public/standard_fonts') + '/',
  }).promise;

  const totalPages = doc.numPages;
  console.log(`Worker 2: generating pages backwards from 699 down to 450...`);

  for (let pageNum = totalPages; pageNum >= 450; pageNum--) {
    const outFile = path.join(outDir, `page_${pageNum}.webp`);

    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 10000) {
      continue;
    }

    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.8 });
    const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    const buf = canvas.toBuffer('image/webp', { quality: 88 });
    fs.writeFileSync(outFile, buf);

    if (pageNum % 25 === 0) {
      console.log(`Worker 2 progress: Page ${pageNum}`);
    }
  }

  console.log('Worker 2 finished!');
}

generateRemaining().catch(console.error);
