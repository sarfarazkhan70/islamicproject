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

console.log(`Sahih Muslim PDF loaded. Num pages: ${doc.numPages}`);

const outDir = 'C:/Users/USER/.gemini/antigravity-ide/brain/de056047-83a2-4c84-bb5c-13dc2b8123a9/scratch/rendered_samples';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const samplePages = [1, 2, 3, 4, 18, 19, 20, 50, 100, 200, 300, 400, 450, 452, 453];

for (const p of samplePages) {
  const page = await doc.getPage(p);
  
  // Render at rotation 0
  const viewport0 = page.getViewport({ scale: 1.0, rotation: 0 });
  const canvas0 = createCanvas(Math.floor(viewport0.width), Math.floor(viewport0.height));
  const ctx0 = canvas0.getContext('2d');
  ctx0.fillStyle = '#ffffff';
  ctx0.fillRect(0, 0, canvas0.width, canvas0.height);
  await page.render({
    canvasContext: ctx0,
    viewport: viewport0,
  }).promise;
  fs.writeFileSync(path.join(outDir, `page_${p}_rot0.png`), canvas0.toBuffer('image/png'));

  // Render at rotation 180
  const viewport180 = page.getViewport({ scale: 1.0, rotation: 180 });
  const canvas180 = createCanvas(Math.floor(viewport180.width), Math.floor(viewport180.height));
  const ctx180 = canvas180.getContext('2d');
  ctx180.fillStyle = '#ffffff';
  ctx180.fillRect(0, 0, canvas180.width, canvas180.height);
  await page.render({
    canvasContext: ctx180,
    viewport: viewport180,
  }).promise;
  fs.writeFileSync(path.join(outDir, `page_${p}_rot180.png`), canvas180.toBuffer('image/png'));

  console.log(`Rendered page ${p} (rot0 and rot180)`);
}

console.log('Sample pages successfully rendered!');
