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

async function testPdfjsRectConversion() {
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

  const testPages = [1, 2, 7, 10, 50, 100, 200, 300, 352, 400, 406, 450, 452, 453];

  for (const pNum of testPages) {
    const page = await doc.getPage(pNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Collect all URL rects from annotations and textContent
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
      if (str.includes('http') || str.includes('blogspot') || str.includes('islamiurdu') || str.includes('www.')) {
        const x = item.transform[4];
        const y = item.transform[5];
        const w = item.width || 320;
        const h = Math.abs(item.transform[3]) || 20;
        const tr = transformPdfRect([x, y, x + w, y + h], viewport.transform);
        rectsToClean.push({ ...tr, source: 'text' });
      }
    }

    console.log(`Page ${pNum} rects to clean:`, rectsToClean);

    // Apply seamless inpainting on each rect
    for (const r of rectsToClean) {
      const padX = 6;
      const padY = 4;
      const x1 = Math.max(0, Math.floor(r.minX - padX));
      const y1 = Math.max(0, Math.floor(r.minY - padY));
      const x2 = Math.min(canvas.width, Math.ceil(r.maxX + padX));
      const y2 = Math.min(canvas.height, Math.ceil(r.maxY + padY));
      const rw = x2 - x1;
      const rh = y2 - y1;

      // Sample surrounding margin pixels (left and right of the box or above/below)
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

    // Page 1 specific cover URL cleanup:
    if (pNum === 1) {
      // Top yellow banner URL:
      const topSample = ctx.getImageData(Math.floor(canvas.width * 0.5), Math.floor(canvas.height * 0.05), 3, 3).data;
      ctx.fillStyle = `rgb(${topSample[0]}, ${topSample[1]}, ${topSample[2]})`;
      ctx.fillRect(Math.floor(canvas.width * 0.07), Math.floor(canvas.height * 0.062), Math.floor(canvas.width * 0.86), Math.floor(canvas.height * 0.038));

      // Bottom banner URL:
      const btmSample = ctx.getImageData(Math.floor(canvas.width * 0.5), Math.floor(canvas.height * 0.98), 3, 3).data;
      ctx.fillStyle = `rgb(${btmSample[0]}, ${btmSample[1]}, ${btmSample[2]})`;
      ctx.fillRect(Math.floor(canvas.width * 0.07), Math.floor(canvas.height * 0.942), Math.floor(canvas.width * 0.86), Math.floor(canvas.height * 0.038));
    }

    const buf = canvas.toBuffer('image/jpeg', { quality: 88 });
    fs.writeFileSync(path.join(scratchDir, `vrect_cleaned_p_${pNum}.jpg`), buf);
  }
  console.log('Finished testing vrect conversion!');
}

testPdfjsRectConversion().catch(console.error);
