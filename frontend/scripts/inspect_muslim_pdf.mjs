import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function inspect() {
  const filePath = path.resolve('public/pdf/sahih_muslim_vol1.pdf');
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  console.log('Total PDF pages in file:', doc.numPages);

  const samplePages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50, 100, 200, 300, 400, 445, 446, 447, 448, 449, 450, 451, 452, 453];
  
  for (const p of samplePages) {
    const page = await doc.getPage(p);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((i) => i.str).join(' ').trim();
    const ops = await page.getOperatorList();
    const view = page.view;
    console.log(`Page ${p}: opsLen=${ops.fnArray.length}, textLen=${text.length}, view=[${view.join(',')}], textSample="${text.slice(0, 60)}"`);
  }
}

inspect().catch(console.error);
