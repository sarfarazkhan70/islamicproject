import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectSamplePages() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.resolve(__dirname, '../public/pdf/sharah_sahih_muslim_vol1.pdf');
  const wasmDir = path.resolve(__dirname, '../public/wasm') + '/';
  const outDir = path.resolve(__dirname, '../scratch_sharah_inspect/samples');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    wasmUrl: wasmDir,
    cMapUrl: path.resolve(__dirname, '../public/cmaps') + '/',
    standardFontDataUrl: path.resolve(__dirname, '../public/standard_fonts') + '/',
  }).promise;

  const totalPages = doc.numPages;
  console.log('Total PDF Pages:', totalPages);

  // Sample points
  const points = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 40, 50, 60, 70, 80, 90, 100,
    150, 200, 250, 300, 350, 400, 450, 500,
    600, 700, 800, 900, 1000, 1100, 1200, 1300, 1335, 1336, 1337, 1338, 1339
  ];

  for (const p of points) {
    if (p > totalPages) continue;
    const page = await doc.getPage(p);
    const vp = page.getViewport({ scale: 1.0 });
    // Render top 120 pixels (header where printed page number is located)
    const headerHeight = Math.min(120, vp.height);
    const canvas = createCanvas(Math.floor(vp.width), headerHeight);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    fs.writeFileSync(path.join(outDir, `header_pdf_${p}.jpg`), canvas.toBuffer('image/jpeg', { quality: 80 }));
  }

  console.log('Sample headers saved to', outDir);
}

inspectSamplePages().catch(console.error);
