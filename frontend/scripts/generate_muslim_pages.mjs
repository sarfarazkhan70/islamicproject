import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function transformPdfRect(rect, transform) {
  const [x1, y1, x2, y2] = rect;
  // transform is [a, b, c, d, e, f]
  const p1x = transform[0] * x1 + transform[2] * y1 + transform[4];
  const p1y = transform[1] * x1 + transform[3] * y1 + transform[5];
  const p2x = transform[0] * x2 + transform[2] * y2 + transform[4];
  const p2y = transform[1] * x2 + transform[3] * y2 + transform[5];

  return {
    minX: Math.min(p1x, p2x),
    maxX: Math.max(p1x, p2x),
    minY: Math.min(p1y, p2y),
    maxY: Math.max(p1y, p2y),
  };
}

async function cleanCoverPage(ctx, w, h) {
  // 1. Top gold frame stripe reconstruction (from clean left corner slice)
  const topSliceW = 4;
  const topSliceX = Math.floor(w * 0.075);
  const topStartY = Math.floor(h * 0.024);
  const topH = Math.floor(h * 0.052);

  const topSlice = ctx.getImageData(topSliceX, topStartY, topSliceW, topH);
  for (let x = Math.floor(w * 0.08); x < Math.floor(w * 0.93); x += topSliceW) {
    ctx.putImageData(topSlice, x, topStartY);
  }

  // 2. Inner white margin top
  ctx.fillStyle = '#fcfbf7';
  ctx.fillRect(Math.floor(w * 0.096), Math.floor(h * 0.076), Math.floor(w * 0.850), Math.floor(h * 0.038));

  // 3. Inner white margin bottom
  ctx.fillRect(Math.floor(w * 0.096), Math.floor(h * 0.942), Math.floor(w * 0.850), Math.floor(h * 0.038));

  // 4. Bottom gold frame stripe reconstruction
  const btmSliceX = Math.floor(w * 0.075);
  const btmStartY = Math.floor(h * 0.970);
  const btmH = Math.floor(h * 0.020);
  const btmSlice = ctx.getImageData(btmSliceX, btmStartY, topSliceW, btmH);
  for (let x = Math.floor(w * 0.08); x < Math.floor(w * 0.93); x += topSliceW) {
    ctx.putImageData(btmSlice, x, btmStartY);
  }

  // 5. Bottom outer red margin
  ctx.fillStyle = '#cf1728';
  ctx.fillRect(0, Math.floor(h * 0.985), w, Math.ceil(h * 0.015));
}

async function generateAllMuslimPages() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.resolve(__dirname, '../public/pdf/sahih_muslim_vol1.pdf');
  const wasmDir = path.resolve(__dirname, '../public/wasm') + '/';
  const outDir = path.resolve(__dirname, '../public/muslim/pages');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Loading Sahih Muslim PDF from:', pdfPath);
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

    const w = canvas.width;
    const h = canvas.height;

    if (pageNum === 1) {
      await cleanCoverPage(ctx, w, h);
    } else {
      // 1. Collect annotation and text rects containing external watermark URLs
      const annotations = await page.getAnnotations();
      const textContent = await page.getTextContent();
      const rectsToClean = [];

      for (const annot of annotations) {
        if (annot.rect) {
          const tr = transformPdfRect(annot.rect, viewport.transform);
          rectsToClean.push({ ...tr, source: 'annot' });
        }
      }

      for (const item of textContent.items) {
        const str = item.str || '';
        if (
          str.includes('http') ||
          str.includes('blogspot') ||
          str.includes('islamiurdu') ||
          str.includes('www.')
        ) {
          const x = item.transform[4];
          const y = item.transform[5];
          const itemW = item.width || 320;
          const itemH = Math.abs(item.transform[3]) || 20;
          const tr = transformPdfRect([x, y, x + itemW, y + itemH], viewport.transform);
          rectsToClean.push({ ...tr, source: 'text' });
        }
      }

      // 2. Inpaint all detected URL rectangles with surrounding margin color
      for (const r of rectsToClean) {
        const padX = 6;
        const padY = 4;
        const x1 = Math.max(0, Math.floor(r.minX - padX));
        const y1 = Math.max(0, Math.floor(r.minY - padY));
        const x2 = Math.min(canvas.width, Math.ceil(r.maxX + padX));
        const y2 = Math.min(canvas.height, Math.ceil(r.maxY + padY));
        const rw = x2 - x1;
        const rh = y2 - y1;

        // Sample surrounding margin pixels (left of the box or above/below)
        let sampleY = Math.max(2, y1 - 4);
        if (sampleY < 5) sampleY = Math.min(canvas.height - 3, y2 + 4);
        const sampleX = Math.max(2, Math.floor(x1 - 10));
        const sPixel = ctx.getImageData(sampleX, sampleY, 3, 3).data;

        let rSum = 0, gSum = 0, bSum = 0;
        for (let i = 0; i < 9; i++) {
          rSum += sPixel[i * 4];
          gSum += sPixel[i * 4 + 1];
          bSum += sPixel[i * 4 + 2];
        }
        const bgR = Math.round(rSum / 9);
        const bgG = Math.round(gSum / 9);
        const bgB = Math.round(bSum / 9);

        ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
        ctx.fillRect(x1, y1, rw, rh);
      }
    }

    const buf = canvas.toBuffer('image/webp', { quality: 88 });
    fs.writeFileSync(outFile, buf);
    generatedCount++;

    if (pageNum % 25 === 0 || pageNum === totalPages) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(
        `Progress: Page ${pageNum}/${totalPages} (${generatedCount} generated, ${elapsed}s elapsed)`
      );
    }
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✓ Finished generating Sahih Muslim pages! Total: ${totalPages} pages in ${totalElapsed}s.`);
}

generateAllMuslimPages().catch((err) => {
  console.error('Error generating Sahih Muslim pages:', err);
  process.exit(1);
});
