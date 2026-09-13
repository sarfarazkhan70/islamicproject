import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');
const outDir = path.resolve('extracted_pages');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function extract() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  console.log(`Document loaded. Num pages = ${doc.numPages}`);

  const samplePages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 20, 30, 50, 100, 500, 1000, 1120, 1124];

  for (const pageNum of samplePages) {
    const page = await doc.getPage(pageNum);
    const ops = await page.getOperatorList();
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        // page.objs.get
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img) {
              console.log(`Page ${pageNum}: Image ${img.width}x${img.height}, kind: ${img.kind}`);
              // If img.data is RGBA or grayscale or JPEG
              if (img.data) {
                // save raw or write info
                console.log(`Page ${pageNum}: data length = ${img.data.length}`);
              }
            }
            resolve();
          });
        });
      }
    }
  }
}

extract().catch(err => console.error('Error:', err));
