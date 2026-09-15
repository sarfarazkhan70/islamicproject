import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to perform smart margin cleaning and inpainting on canvas
function cleanPageCanvas(canvas, pageNum, rotation) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // 1. Top margin cleanup for all standard pages
  // Most pages have the URL in the top margin between y = 0 and the top book frame border.
  // We locate the top border by scanning from y = 0.02*h to 0.10*h for a strong horizontal border line.
  
  if (pageNum === 1) {
    // Page 1: Outer cover
    // Top banner URL: y: 0 to 0.048 * h, x: 0.05 * w to 0.95 * w
    // Sample surrounding yellow frame color
    ctx.fillStyle = '#f8d975'; // Gold/yellow border background
    ctx.fillRect(Math.floor(w * 0.08), Math.floor(h * 0.028), Math.floor(w * 0.84), Math.floor(h * 0.024));
    
    // Bottom banner URL: y: 0.955 * h to 0.985 * h
    ctx.fillStyle = '#d01428'; // Red cover background
    ctx.fillRect(Math.floor(w * 0.08), Math.floor(h * 0.954), Math.floor(w * 0.84), Math.floor(h * 0.028));
    return;
  }

  if (pageNum === 453) {
    // Page 453: Back cover ad
    // Top URL: y: 0.045 * h to 0.08 * h
    // Magenta background
    const topSampleCtx = ctx.getImageData(Math.floor(w * 0.5), Math.floor(h * 0.04), 1, 1).data;
    ctx.fillStyle = `rgb(${topSampleCtx[0]}, ${topSampleCtx[1]}, ${topSampleCtx[2]})`;
    ctx.fillRect(Math.floor(w * 0.15), Math.floor(h * 0.045), Math.floor(w * 0.70), Math.floor(h * 0.035));

    // Bottom URL: y: 0.93 * h to 0.975 * h
    const btmSampleCtx = ctx.getImageData(Math.floor(w * 0.5), Math.floor(h * 0.98), 1, 1).data;
    ctx.fillStyle = `rgb(${btmSampleCtx[0]}, ${btmSampleCtx[1]}, ${btmSampleCtx[2]})`;
    ctx.fillRect(Math.floor(w * 0.15), Math.floor(h * 0.93), Math.floor(w * 0.70), Math.floor(h * 0.045));
    return;
  }

  // Find top border line on standard pages
  const imgData = ctx.getImageData(0, 0, w, Math.floor(h * 0.12));
  const pixels = imgData.data;
  let topBorderY = -1;

  for (let y = Math.floor(h * 0.025); y < Math.floor(h * 0.10); y++) {
    let darkPixels = 0;
    for (let x = Math.floor(w * 0.15); x < Math.floor(w * 0.85); x++) {
      const idx = (y * w + x) * 4;
      const lum = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
      if (lum < 160) darkPixels++;
    }
    // A border line spans > 50% of the width
    if (darkPixels > (w * 0.7) * 0.5) {
      topBorderY = y;
      break;
    }
  }

  // If a top border line was found, clean the area above it (with a 4px safety buffer before the border)
  const cleanTopMaxY = topBorderY > 0 ? topBorderY - 4 : Math.floor(h * 0.045);
  
  // Sample the paper color in the margin (e.g. at x = 0.5*w, y = 10)
  const sampleData = ctx.getImageData(Math.floor(w * 0.5), Math.max(2, Math.floor(cleanTopMaxY / 2)), 5, 5).data;
  let rSum = 0, gSum = 0, bSum = 0;
  for (let i = 0; i < 25; i++) {
    rSum += sampleData[i * 4];
    gSum += sampleData[i * 4 + 1];
    bSum += sampleData[i * 4 + 2];
  }
  const bgR = Math.round(rSum / 25);
  const bgG = Math.round(gSum / 25);
  const bgB = Math.round(bSum / 25);
  
  ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
  ctx.fillRect(0, 0, w, cleanTopMaxY);

  // Specific interstitial URLs on certain pages:
  if (pageNum === 7) {
    // Under header title
    ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
    ctx.fillRect(Math.floor(w * 0.20), Math.floor(h * 0.22), Math.floor(w * 0.60), Math.floor(h * 0.035));
  }
  if (pageNum === 352) {
    // Under stars
    ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
    ctx.fillRect(Math.floor(w * 0.20), Math.floor(h * 0.66), Math.floor(w * 0.60), Math.floor(h * 0.035));
  }
  if (pageNum === 406) {
    // Below stars left margin
    ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
    ctx.fillRect(Math.floor(w * 0.05), Math.floor(h * 0.36), Math.floor(w * 0.32), Math.floor(h * 0.035));
  }
  if (pageNum === 452) {
    // Under stars
    ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
    ctx.fillRect(Math.floor(w * 0.20), Math.floor(h * 0.33), Math.floor(w * 0.60), Math.floor(h * 0.035));
  }
}

async function testCleanedPages() {
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

  const testPages = [1, 2, 3, 4, 5, 7, 10, 50, 100, 200, 300, 352, 400, 406, 450, 452, 453];

  for (const pNum of testPages) {
    const page = await doc.getPage(pNum);
    const rotation = pNum === 2 ? 180 : 0;
    const viewport = page.getViewport({ scale: 1.5, rotation });
    const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;

    cleanPageCanvas(canvas, pNum, rotation);

    const buf = canvas.toBuffer('image/jpeg', { quality: 88 });
    fs.writeFileSync(path.join(scratchDir, `cleaned_p_${pNum}.jpg`), buf);
  }
  console.log('Cleaned test pages written to scratch!');
}

testCleanedPages().catch(console.error);
