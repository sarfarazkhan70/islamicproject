import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeAll453Pages() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = path.resolve(__dirname, '../public/pdf/sahih_muslim_vol1.pdf');
  const scratchDir = 'C:/Users/USER/.gemini/antigravity-ide/brain/28908bcb-6f74-44ee-82d0-ffbe955075b0/scratch';

  console.log('Loading PDF...');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    wasmUrl: path.resolve(__dirname, '../public/wasm') + '/',
    cMapUrl: path.resolve(__dirname, '../public/cmaps') + '/',
    standardFontDataUrl: path.resolve(__dirname, '../public/standard_fonts') + '/',
  }).promise;

  const totalPages = doc.numPages;
  console.log(`Analyzing ${totalPages} pages...`);

  const results = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 0.8 });
    const width = Math.floor(viewport.width);
    const height = Math.floor(viewport.height);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    await page.render({ canvasContext: ctx, viewport }).promise;

    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;

    // Convert to grayscale & dark-pixel intensity
    // Standard white background is ~255, dark text is < 150
    const rowDarkness = new Float32Array(height);
    for (let y = 0; y < height; y++) {
      let darkCount = 0;
      for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.9); x++) {
        const idx = (y * width + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < 160) {
          darkCount++;
        }
      }
      rowDarkness[y] = darkCount;
    }

    // Top region (y from 3% to 15%) vs Bottom region (y from 85% to 97%)
    const topStartY = Math.floor(height * 0.03);
    const topEndY = Math.floor(height * 0.16);
    const bottomStartY = Math.floor(height * 0.84);
    const bottomEndY = Math.floor(height * 0.97);

    // Look for sharp horizontal lines (header bars)
    // A header bar has very high horizontal dark count across many consecutive or near-consecutive rows
    let maxTopLine = 0;
    let topDarkSum = 0;
    for (let y = topStartY; y < topEndY; y++) {
      if (rowDarkness[y] > maxTopLine) maxTopLine = rowDarkness[y];
      topDarkSum += rowDarkness[y];
    }

    let maxBottomLine = 0;
    let bottomDarkSum = 0;
    for (let y = bottomStartY; y < bottomEndY; y++) {
      if (rowDarkness[y] > maxBottomLine) maxBottomLine = rowDarkness[y];
      bottomDarkSum += rowDarkness[y];
    }

    // Check page number oval location
    // Oval at bottom is narrow horizontally in center
    let bottomOvalScore = 0;
    let topOvalScore = 0;

    for (let y = Math.floor(height * 0.92); y < Math.floor(height * 0.98); y++) {
      let centerDark = 0;
      let marginDark = 0;
      for (let x = Math.floor(width * 0.35); x < Math.floor(width * 0.65); x++) {
        const idx = (y * width + x) * 4;
        const lum = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
        if (lum < 160) centerDark++;
      }
      for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.3); x++) {
        const idx = (y * width + x) * 4;
        const lum = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
        if (lum < 160) marginDark++;
      }
      if (centerDark > 5 && marginDark < 5) bottomOvalScore += centerDark;
    }

    for (let y = Math.floor(height * 0.02); y < Math.floor(height * 0.08); y++) {
      let centerDark = 0;
      let marginDark = 0;
      for (let x = Math.floor(width * 0.35); x < Math.floor(width * 0.65); x++) {
        const idx = (y * width + x) * 4;
        const lum = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
        if (lum < 160) centerDark++;
      }
      for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.3); x++) {
        const idx = (y * width + x) * 4;
        const lum = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
        if (lum < 160) marginDark++;
      }
      if (centerDark > 5 && marginDark < 5) topOvalScore += centerDark;
    }

    // Determine orientation
    let isUpsideDown = false;
    let confidence = 'normal';

    // If bottom has a strong header line and top doesn't, or top has bottom-oval pattern
    if (maxBottomLine > width * 0.5 && maxTopLine < width * 0.3) {
      isUpsideDown = true;
      confidence = 'high_bottom_header';
    } else if (topOvalScore > 100 && bottomOvalScore < 20 && maxBottomLine > maxTopLine * 1.5) {
      isUpsideDown = true;
      confidence = 'high_top_oval';
    } else if (maxTopLine > width * 0.5 && maxBottomLine < width * 0.3) {
      isUpsideDown = false;
      confidence = 'high_top_header';
    }

    results.push({
      pageNum,
      isUpsideDown,
      confidence,
      maxTopLine: Math.round(maxTopLine),
      maxBottomLine: Math.round(maxBottomLine),
      topDarkSum: Math.round(topDarkSum),
      bottomDarkSum: Math.round(bottomDarkSum),
      topOvalScore: Math.round(topOvalScore),
      bottomOvalScore: Math.round(bottomOvalScore),
      width,
      height,
    });

    if (pageNum % 50 === 0 || pageNum === totalPages) {
      console.log(`Processed ${pageNum}/${totalPages} pages`);
    }
  }

  fs.writeFileSync(path.join(scratchDir, 'orientation_analysis.json'), JSON.stringify(results, null, 2));
  console.log('Saved orientation_analysis.json');
}

analyzeAll453Pages().catch(console.error);
