import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.resolve(__dirname, '../public/pdf/jami_at_tirmizi_vol2_part1.pdf');
  const wasmDir = path.resolve(__dirname, '../public/wasm') + '/';
  const outDir = path.resolve(__dirname, '../public/tirmizi/vol4/pages');
  const coverDir = path.resolve(__dirname, '../public/tirmizi/vol4');
  const cropsDir = path.resolve(__dirname, 'p4_crops');

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });
  if (!fs.existsSync(cropsDir)) fs.mkdirSync(cropsDir, { recursive: true });

  console.log('Loading Tirmizi Vol 2 Part 1 (Part 4) PDF from:', pdfPath);
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

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const outFile = path.join(outDir, `page_${pageNum}.webp`);

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

    const webpBuffer = canvas.toBuffer('image/webp', 88);
    fs.writeFileSync(outFile, webpBuffer);

    // Save cover if page 1
    if (pageNum === 1) {
      fs.writeFileSync(path.join(coverDir, 'cover.webp'), webpBuffer);
    }

    // Crop header number area
    const cropX = Math.floor(canvas.width * 0.40);
    const cropW = Math.floor(canvas.width * 0.20);
    const cropY = 0;
    const cropH = Math.floor(canvas.height * 0.10);
    const cropCanvas = createCanvas(cropW, cropH);
    const cropCtx = cropCanvas.getContext('2d');
    cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    fs.writeFileSync(path.join(cropsDir, `num_${pageNum}.png`), cropCanvas.toBuffer('image/png'));

    generatedCount++;

    if (pageNum % 25 === 0 || pageNum === totalPages || pageNum <= 5) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const sizeKb = (webpBuffer.length / 1024).toFixed(1);
      console.log(`Rendered page ${pageNum}/${totalPages} (${sizeKb} KB) in ${elapsed}s`);
    }
  }

  console.log(`All ${generatedCount} pages generated successfully in ${((Date.now() - startTime) / 1000).toFixed(1)}s!`);
}

main().catch(console.error);
