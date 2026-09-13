import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

// Let's create an indexed strip of page headers (top 70px) and page margins (left 50px & right 50px)
// Or create a combined overview grid of header strips
async function extractHeaders() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  console.log(`Document loaded: ${doc.numPages} pages.`);

  const outDir = path.resolve('header_strips');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Let's extract top 75px of every page and save in chunks of 50 per composite image
  // This lets us visually or programmatically review 1124 pages in just 23 composite images!
  const chunkSize = 50;
  for (let chunk = 0; chunk * chunkSize < doc.numPages; chunk++) {
    const startPage = chunk * chunkSize + 1;
    const endPage = Math.min(doc.numPages, (chunk + 1) * chunkSize);
    const count = endPage - startPage + 1;

    // Composite canvas: width = 794 + 60 (for page label), height = count * 75
    const compCanvas = createCanvas(860, count * 75);
    const compCtx = compCanvas.getContext('2d');
    compCtx.fillStyle = '#ffffff';
    compCtx.fillRect(0, 0, 860, count * 75);

    for (let p = startPage; p <= endPage; p++) {
      const page = await doc.getPage(p);
      const ops = await page.getOperatorList();
      
      for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
          const objId = ops.argsArray[i][0];
          await new Promise((resolve) => {
            page.objs.get(objId, (img) => {
              if (img && img.data) {
                const rowY = (p - startPage) * 75;
                
                // Draw label
                compCtx.fillStyle = '#222222';
                compCtx.font = 'bold 16px sans-serif';
                compCtx.fillText(`P.${p}`, 5, rowY + 45);

                // Copy top 75px of image
                const headerHeight = Math.min(75, img.height);
                const headerWidth = Math.min(794, img.width);
                const imgData = compCtx.createImageData(headerWidth, headerHeight);

                let srcIdx = 0;
                let dstIdx = 0;
                for (let y = 0; y < headerHeight; y++) {
                  for (let x = 0; x < headerWidth; x++) {
                    imgData.data[dstIdx] = img.data[srcIdx];
                    imgData.data[dstIdx + 1] = img.data[srcIdx + 1];
                    imgData.data[dstIdx + 2] = img.data[srcIdx + 2];
                    imgData.data[dstIdx + 3] = 255;
                    srcIdx += 3;
                    dstIdx += 4;
                  }
                  // skip rest of row in src if wider
                  srcIdx += (img.width - headerWidth) * 3;
                }
                compCtx.putImageData(imgData, 60, rowY);
              }
              resolve();
            });
          });
          break;
        }
      }
    }

    const outPath = path.join(outDir, `headers_${String(startPage).padStart(4, '0')}_to_${String(endPage).padStart(4, '0')}.png`);
    fs.writeFileSync(outPath, compCanvas.toBuffer('image/png'));
    console.log(`Saved composite headers: ${outPath}`);
  }
}

extractHeaders().catch(err => console.error(err));
