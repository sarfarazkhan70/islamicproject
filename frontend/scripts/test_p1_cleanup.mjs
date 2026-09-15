import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPage1Cleanup() {
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

  // Let's inspect the top stripe region: y from 0.05*h to 0.10*h, x from 0.08*w to 0.92*w
  // Look at x from 0.07*w to 0.10*w (before the text starts): it is clean gold stripes!
  // We can sample a vertical slice of 1px width at x = Math.floor(w * 0.08) and tile it across x = 0.08*w to 0.92*w for the top!
  const topSliceW = 8;
  const topSliceX = Math.floor(w * 0.075);
  const topStartY = Math.floor(h * 0.055);
  const topH = Math.floor(h * 0.045);

  const topSlice = ctx.getImageData(topSliceX, topStartY, topSliceW, topH);
  for (let x = Math.floor(w * 0.08); x < Math.floor(w * 0.92); x += topSliceW) {
    ctx.putImageData(topSlice, x, topStartY);
  }

  // Same for bottom stripe:
  const btmStartY = Math.floor(h * 0.940);
  const btmH = Math.floor(h * 0.055);
  const btmSliceX = Math.floor(w * 0.075);
  const btmSlice = ctx.getImageData(btmSliceX, btmStartY, topSliceW, btmH);
  for (let x = Math.floor(w * 0.08); x < Math.floor(w * 0.92); x += topSliceW) {
    ctx.putImageData(btmSlice, x, btmStartY);
  }

  const buf = canvas.toBuffer('image/jpeg', { quality: 90 });
  fs.writeFileSync(path.join(scratchDir, 'cleaned_cover_p1.jpg'), buf);
  console.log('Saved cleaned_cover_p1.jpg');
}

testPage1Cleanup().catch(console.error);
