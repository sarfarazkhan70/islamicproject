import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');
const outDir = path.resolve('sample_images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function saveImages() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  // Let's inspect pages 1..10, 11, 12, 13, 14, 15, 20, 50, 100, 500, 1120..1124
  const pagesToSave = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20, 1120, 1121, 1122, 1123, 1124];

  for (const pageNum of pagesToSave) {
    const page = await doc.getPage(pageNum);
    const ops = await page.getOperatorList();
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              const canvas = createCanvas(img.width, img.height);
              const ctx = canvas.getContext('2d');
              const imgData = ctx.createImageData(img.width, img.height);
              
              // img.kind === 2 is RGB (3 channels)
              let srcIdx = 0;
              let dstIdx = 0;
              for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                  imgData.data[dstIdx] = img.data[srcIdx];       // R
                  imgData.data[dstIdx + 1] = img.data[srcIdx + 1]; // G
                  imgData.data[dstIdx + 2] = img.data[srcIdx + 2]; // B
                  imgData.data[dstIdx + 3] = 255;                // A
                  srcIdx += 3;
                  dstIdx += 4;
                }
              }
              ctx.putImageData(imgData, 0, 0);
              const outPath = path.join(outDir, `page_${String(pageNum).padStart(4, '0')}.png`);
              fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
              console.log(`Saved page ${pageNum} to ${outPath}`);
            }
            resolve();
          });
        });
      }
    }
  }
}

saveImages().catch(err => console.error('Error:', err));
