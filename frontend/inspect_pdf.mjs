import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

async function inspect() {
  console.log('Loading PDF from:', pdfPath);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  
  console.log('Total Pages:', doc.numPages);
  
  const samplePages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50, 100, 300, 500, 604, doc.numPages - 2, doc.numPages - 1, doc.numPages];
  
  for (const pageNum of samplePages) {
    if (pageNum > doc.numPages || pageNum < 1) continue;
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const text = textContent.items.map(i => i.str).filter(Boolean).join(' ');
    console.log(`Page ${pageNum}: Dim = ${viewport.width.toFixed(1)}x${viewport.height.toFixed(1)} (Aspect: ${(viewport.width/viewport.height).toFixed(3)}), Text length: ${text.length}, Preview: ${text.slice(0, 120)}`);
  }
}

inspect().catch(err => console.error('Error:', err));
