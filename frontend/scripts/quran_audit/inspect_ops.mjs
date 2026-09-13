import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

async function inspectImages() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  console.log(`Document loaded. Num pages = ${doc.numPages}`);

  for (let i = 1; i <= 10; i++) {
    const page = await doc.getPage(i);
    const ops = await page.getOperatorList();
    console.log(`Page ${i}: ${ops.fnArray.length} operators, args: ${ops.argsArray.length}`);
    // Check if paintImageXObject is used
    const imgOps = ops.fnArray.filter(fn => fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintInlineImageXObject);
    console.log(`Page ${i}: has ${imgOps.length} images`);
  }
}

inspectImages().catch(err => console.error('Overall Error:', err));
