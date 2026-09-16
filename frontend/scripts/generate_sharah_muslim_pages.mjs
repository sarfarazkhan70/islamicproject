import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSharahMuslimPages() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.resolve(__dirname, '../public/pdf/sharah_sahih_muslim_vol1.pdf');
  const wasmDir = path.resolve(__dirname, '../public/wasm') + '/';
  const outDir = path.resolve(__dirname, '../public/sharah-muslim/jild-1');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Loading Sharh Sahih Muslim Jild 1 PDF from:', pdfPath);
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

  // Let's process with concurrency
  const CONCURRENCY = 4;
  let currentIdx = 1;

  async function worker(workerId) {
    while (currentIdx <= totalPages) {
      const pageNum = currentIdx++;
      const outFile = path.join(outDir, `page_${pageNum}.webp`);

      // If file already exists and has valid size (> 5KB), skip
      if (fs.existsSync(outFile)) {
        const s = fs.statSync(outFile);
        if (s.size > 5000) {
          skippedCount++;
          continue;
        }
      }

      try {
        const page = await doc.getPage(pageNum);
        // Scale 1.5 gives crisp High-DPI page width around 870px, perfect for reading & zoom
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        const buf = canvas.toBuffer('image/webp', { quality: 80 });
        fs.writeFileSync(outFile, buf);
        generatedCount++;

        if ((generatedCount + skippedCount) % 50 === 0 || pageNum === totalPages) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const totalDone = generatedCount + skippedCount;
          const rate = (generatedCount / ((Date.now() - startTime) / 1000)).toFixed(1);
          console.log(
            `[Progress] Page ${totalDone}/${totalPages} (${generatedCount} generated, ${skippedCount} skipped, ${elapsed}s, ~${rate} p/s)`
          );
        }
      } catch (err) {
        console.error(`Error generating page ${pageNum}:`, err);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(i));
  }
  await Promise.all(workers);

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `✓ Finished generating Sharh Sahih Muslim Jild 1 pages! Total: ${totalPages} pages in ${totalElapsed}s.`
  );
}

generateSharahMuslimPages().catch((err) => {
  console.error('Error generating Sharh Sahih Muslim pages:', err);
  process.exit(1);
});
