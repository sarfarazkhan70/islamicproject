import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectPages() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.resolve(__dirname, '../public/pdf/sharah_sahih_muslim_vol1.pdf');
  const wasmDir = path.resolve(__dirname, '../public/wasm') + '/';
  const outDir = path.resolve(__dirname, '../scratch_sharah_inspect');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('Inspecting PDF:', pdfPath);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    wasmUrl: wasmDir,
    cMapUrl: path.resolve(__dirname, '../public/cmaps') + '/',
    standardFontDataUrl: path.resolve(__dirname, '../public/standard_fonts') + '/',
  }).promise;

  console.log('Total PDF pages:', doc.numPages);

  // Inspect first 30 pages and some later pages
  const pagesToCheck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 50, 100, 200, 500, doc.numPages - 1, doc.numPages];

  for (const pageNum of pagesToCheck) {
    if (pageNum > doc.numPages) continue;
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const strings = textContent.items.map(i => i.str).filter(s => s.trim().length > 0);
    
    // Render thumbnail to inspect visually
    const thumbViewport = page.getViewport({ scale: 0.5 });
    const canvas = createCanvas(Math.floor(thumbViewport.width), Math.floor(thumbViewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: thumbViewport }).promise;
    fs.writeFileSync(path.join(outDir, `inspect_page_${pageNum}.jpg`), canvas.toBuffer('image/jpeg', { quality: 75 }));

    console.log(`PDF Page ${pageNum} (${viewport.width}x${viewport.height}): Strings sample:`, strings.slice(0, 10).join(' | '));
  }
}

inspectPages().catch(console.error);
