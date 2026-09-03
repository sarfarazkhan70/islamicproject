import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function identifyAllPages() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const outDir = path.resolve('scratch/all_juz29_30_crops');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Render header / banner strip for each page from 1044 to 1124
  for (let p = 1044; p <= 1124; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    fs.writeFileSync(path.join(outDir, `page_${p}.png`), canvas.toBuffer('image/png'));
  }
  console.log('Rendered all pages from 1044 to 1124');
}

identifyAllPages().catch(console.error);
