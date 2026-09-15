import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function renderBatch(start, end) {
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

  for (let pNum = start; pNum <= end; pNum++) {
    const page = await doc.getPage(pNum);
    const viewport = page.getViewport({ scale: 0.8 });
    const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const buf = canvas.toBuffer('image/jpeg', { quality: 75 });
    fs.writeFileSync(path.join(scratchDir, `p_${pNum}.jpg`), buf);
  }
  console.log(`Rendered pages ${start} to ${end}`);
}

const args = process.argv.slice(2);
const start = parseInt(args[0] || '1', 10);
const end = parseInt(args[1] || '25', 10);

renderBatch(start, end).catch(console.error);
