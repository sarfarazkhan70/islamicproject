import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateAllBukhariPages() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.resolve(__dirname, '../public/pdf/bukhari_shareef_drive.pdf');
  const wasmDir = path.resolve(__dirname, '../public/wasm') + '/';
  const outDir = path.resolve(__dirname, '../public/bukhari/pages');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Loading PDF from:', pdfPath);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    wasmUrl: wasmDir,
    cMapUrl: path.resolve(__dirname, '../public/cmaps') + '/',
    standardFontDataUrl: path.resolve(__dirname, '../public/standard_fonts') + '/',
  }).promise;

  const totalPages = doc.numPages;
  console.log(`Document loaded successfully. Total pages: ${totalPages}`);

  const startTime = Date.now();
  let generatedCount = 0;
  let skippedCount = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const outFile = path.join(outDir, `page_${pageNum}.webp`);

    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 10000) {
      skippedCount++;
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
    generatedCount++;

    if (pageNum % 25 === 0 || pageNum === totalPages) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Progress: Page ${pageNum}/${totalPages} (${generatedCount} generated, ${skippedCount} skipped, ${elapsed}s elapsed)`);
    }
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✓ Finished generating Bukhari pages! Total: ${totalPages} pages in ${totalElapsed}s.`);
}

generateAllBukhariPages().catch((err) => {
  console.error('Error generating Bukhari pages:', err);
  process.exit(1);
});
