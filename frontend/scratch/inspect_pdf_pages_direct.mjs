import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function inspectPdfPages() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  console.log('PDF doc total pages:', doc.numPages);

  const outDir = path.resolve('scratch/pdf_page_inspection');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const testPages = [1, 2, 3, 4, 5, 40, 41, 42, 91, 92, 93, 142, 143, 144, 541, 542, 543, 811, 812, 813, 1043, 1044, 1123, 1124];

  for (const p of testPages) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;
    fs.writeFileSync(path.join(outDir, `pdf_page_${String(p).padStart(4, '0')}.png`), canvas.toBuffer('image/png'));
    console.log(`Rendered PDF page ${p} (${viewport.width}x${viewport.height})`);
  }
}

inspectPdfPages().catch(console.error);
