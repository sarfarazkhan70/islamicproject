import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateContactSheets() {
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

  const totalPages = doc.numPages; // 453
  const COLS = 5;
  const ROWS = 5;
  const PER_SHEET = COLS * ROWS; // 25
  const THUMB_W = 200;
  const THUMB_H = 270;

  const totalSheets = Math.ceil(totalPages / PER_SHEET);

  for (let s = 0; s < totalSheets; s++) {
    const startP = s * PER_SHEET + 1;
    const endP = Math.min(totalPages, (s + 1) * PER_SHEET);

    const sheetCanvas = createCanvas(COLS * THUMB_W, ROWS * THUMB_H);
    const sCtx = sheetCanvas.getContext('2d');
    sCtx.fillStyle = '#1e293b';
    sCtx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

    for (let pNum = startP; pNum <= endP; pNum++) {
      const idx = pNum - startP;
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const posX = col * THUMB_W;
      const posY = row * THUMB_H;

      const page = await doc.getPage(pNum);
      const viewport = page.getViewport({ scale: THUMB_W / page.view[2] });
      const pCanvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
      const pCtx = pCanvas.getContext('2d');
      pCtx.fillStyle = '#ffffff';
      pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);

      await page.render({ canvasContext: pCtx, viewport }).promise;

      // Draw onto sheet
      sCtx.drawImage(pCanvas, posX, posY, THUMB_W, THUMB_H - 24);

      // Label with page number
      sCtx.fillStyle = '#0f172a';
      sCtx.fillRect(posX, posY + THUMB_H - 24, THUMB_W, 24);
      sCtx.fillStyle = '#38bdf8';
      sCtx.font = 'bold 14px sans-serif';
      sCtx.textAlign = 'center';
      sCtx.fillText(`Page ${pNum}`, posX + THUMB_W / 2, posY + THUMB_H - 7);
    }

    const buf = sheetCanvas.toBuffer('image/jpeg', { quality: 80 });
    fs.writeFileSync(path.join(scratchDir, `grid_${s + 1}.jpg`), buf);
    console.log(`Generated sheet ${s + 1}/${totalSheets} (pages ${startP}-${endP})`);
  }

  console.log('Finished generating all contact sheets!');
}

generateContactSheets().catch(console.error);
