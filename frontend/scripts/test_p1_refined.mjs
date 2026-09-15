import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPage1Refined() {
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

  // Top gold frame
  const topSliceW = 4;
  const topSliceX = Math.floor(w * 0.100);
  const topStartY = Math.floor(h * 0.060);
  const topH = Math.floor(h * 0.038);

  const topSlice = ctx.getImageData(topSliceX, topStartY, topSliceW, topH);
  for (let x = Math.floor(w * 0.095); x < Math.floor(w * 0.948); x += topSliceW) {
    ctx.putImageData(topSlice, x, topStartY);
  }

  // Bottom gold frame
  const btmSliceX = Math.floor(w * 0.100);
  const btmStartY = Math.floor(h * 0.942);
  const btmH = Math.floor(h * 0.040);
  const btmSlice = ctx.getImageData(btmSliceX, btmStartY, topSliceW, btmH);
  for (let x = Math.floor(w * 0.095); x < Math.floor(w * 0.948); x += topSliceW) {
    ctx.putImageData(btmSlice, x, btmStartY);
  }

  // Outer bottom red margin
  ctx.fillStyle = '#cf1728';
  ctx.fillRect(0, Math.floor(h * 0.982), w, Math.ceil(h * 0.018));

  const buf = canvas.toBuffer('image/jpeg', { quality: 92 });
  fs.writeFileSync(path.join(scratchDir, 'cleaned_cover_refined.jpg'), buf);
  console.log('Saved cleaned_cover_refined.jpg');
}

testPage1Refined().catch(console.error);
