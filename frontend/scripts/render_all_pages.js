const fs = require('fs');
const path = require('path');
const napi = require('@napi-rs/canvas');

global.DOMMatrix = napi.DOMMatrix;
global.Path2D = napi.Path2D;
global.ImageData = napi.ImageData;

class CustomCanvasFactory {
  create(width, height) {
    const canvas = napi.createCanvas(width, height);
    const context = canvas.getContext('2d');
    return { canvas, context };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

async function renderAll() {
  const pdfPath = path.resolve('public/pdf/fatawa/fatawa_razawiyya_vol_1_1.pdf');
  const outDir = path.resolve('public/fatawa/vol_1_1/pages');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const canvasFactory = new CustomCanvasFactory();
  const doc = await pdfjs.getDocument({ data, canvasFactory }).promise;
  const total = doc.numPages;
  console.log(`Starting rendering of ${total} pages for Fatawa-e-Razviya Jild 1.1...`);

  const startTime = Date.now();
  for (let i = 1; i <= total; i++) {
    const targetFile = path.join(outDir, `page_${i}.webp`);
    if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 1000) {
      // Already rendered
      continue;
    }

    const page = await doc.getPage(i);
    const scale = 1.5; // High-DPI crystal clear text
    const viewport = page.getViewport({ scale });
    const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

    await page.render({
      canvasContext: canvasAndContext.context,
      viewport: viewport,
      canvasFactory: canvasFactory,
    }).promise;

    const buf = canvasAndContext.canvas.toBuffer('image/webp', 85);
    fs.writeFileSync(targetFile, buf);

    if (i % 25 === 0 || i === total) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Rendered page ${i}/${total} (${elapsed}s elapsed)`);
    }
  }

  console.log(`ALL ${total} PAGES RENDERED SUCCESSFULLY TO ${outDir}!`);
}

renderAll().catch((err) => {
  console.error('Batch rendering error:', err);
  process.exit(1);
});
