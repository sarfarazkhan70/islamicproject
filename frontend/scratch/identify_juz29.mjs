import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function identifySurahPages() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  // Let's render a preview of pages 1044 to 1085 to see exact Surahs
  const outDir = path.resolve('scratch/juz29_pages');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let p = 1044; p <= 1084; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    fs.writeFileSync(path.join(outDir, `page_${p}.png`), canvas.toBuffer('image/png'));
  }
  console.log('Saved Juz 29 pages');
}

identifySurahPages().catch(console.error);
