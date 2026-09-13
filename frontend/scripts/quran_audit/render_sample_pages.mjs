import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');
const outDir = path.resolve('scratch_pages');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function renderPages() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  console.log(`Document loaded. Num pages = ${doc.numPages}`);

  const testPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  for (const pageNum of testPages) {
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
      const context = canvas.getContext('2d');
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      await page.render(renderContext).promise;

      const outPath = path.join(outDir, `page_${String(pageNum).padStart(4, '0')}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
      console.log(`Rendered page ${pageNum} to ${outPath}`);
    } catch (e) {
      console.error(`Error on page ${pageNum}:`, e);
    }
  }
}

renderPages().catch(err => console.error('Overall Error:', err));
