import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPage1Master() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.resolve(__dirname, '../public/pdf/sahih_muslim_vol1.pdf');
  const scratchDir = 'C:/Users/USER/.gemini/antigravity-ide/brain/28908bcb-6f74-44ee-82d0-ffbe955075b0/scratch';

  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(pdfPath)) }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport }).promise;

  const w = canvas.width;
  const h = canvas.height;

  // 1. Top gold frame stripe reconstruction (from clean left corner)
  const topSliceW = 4;
  const topSliceX = Math.floor(w * 0.075);
  const topStartY = Math.floor(h * 0.024);
  const topH = Math.floor(h * 0.052);

  const topSlice = ctx.getImageData(topSliceX, topStartY, topSliceW, topH);
  for (let x = Math.floor(w * 0.08); x < Math.floor(w * 0.93); x += topSliceW) {
    ctx.putImageData(topSlice, x, topStartY);
  }

  // 2. Inner white margin top
  ctx.fillStyle = '#fcfbf7';
  ctx.fillRect(Math.floor(w * 0.096), Math.floor(h * 0.076), Math.floor(w * 0.850), Math.floor(h * 0.038));

  // 3. Inner white margin bottom
  ctx.fillRect(Math.floor(w * 0.096), Math.floor(h * 0.942), Math.floor(w * 0.850), Math.floor(h * 0.038));

  // 4. Bottom gold frame stripe reconstruction
  const btmSliceX = Math.floor(w * 0.075);
  const btmStartY = Math.floor(h * 0.970);
  const btmH = Math.floor(h * 0.020);
  const btmSlice = ctx.getImageData(btmSliceX, btmStartY, topSliceW, btmH);
  for (let x = Math.floor(w * 0.08); x < Math.floor(w * 0.93); x += topSliceW) {
    ctx.putImageData(btmSlice, x, btmStartY);
  }

  // 5. Bottom outer red margin
  ctx.fillStyle = '#cf1728';
  ctx.fillRect(0, Math.floor(h * 0.985), w, Math.ceil(h * 0.015));

  const buf = canvas.toBuffer('image/jpeg', { quality: 92 });
  fs.writeFileSync(path.join(scratchDir, 'test_cover_master.jpg'), buf);
  console.log('Saved test_cover_master.jpg');
}

testPage1Master().catch(console.error);
