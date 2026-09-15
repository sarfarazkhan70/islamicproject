import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPage1Precise() {
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

  // Top white/cream inner margin where URL was printed:
  // x: 0.098*w to 0.945*w, y: 0.076*h to 0.116*h
  ctx.fillStyle = '#fcfbf7';
  ctx.fillRect(Math.floor(w * 0.096), Math.floor(h * 0.076), Math.floor(w * 0.850), Math.floor(h * 0.040));

  // Bottom white/cream inner margin:
  // x: 0.098*w to 0.945*w, y: 0.945*h to 0.985*h
  ctx.fillRect(Math.floor(w * 0.096), Math.floor(h * 0.945), Math.floor(w * 0.850), Math.floor(h * 0.040));

  // Bottom outer red border strip:
  ctx.fillStyle = '#cf1728';
  ctx.fillRect(0, Math.floor(h * 0.985), w, Math.ceil(h * 0.015));

  const buf = canvas.toBuffer('image/jpeg', { quality: 92 });
  fs.writeFileSync(path.join(scratchDir, 'test_cover_precise.jpg'), buf);
  console.log('Saved test_cover_precise.jpg');
}

testPage1Precise().catch(console.error);
