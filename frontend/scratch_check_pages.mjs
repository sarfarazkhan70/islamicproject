import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

async function extractPageImage(pageNum) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(pageNum);
  const ops = await page.getOperatorList();
  
  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
      const objId = ops.argsArray[i][0];
      return new Promise((resolve) => {
        page.objs.get(objId, (img) => {
          if (img && img.data) {
            const canvas = createCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            const imgData = ctx.createImageData(img.width, img.height);
            let srcIdx = 0;
            let dstIdx = 0;
            for (let y = 0; y < img.height; y++) {
              for (let x = 0; x < img.width; x++) {
                imgData.data[dstIdx] = img.data[srcIdx];
                imgData.data[dstIdx + 1] = img.data[srcIdx + 1];
                imgData.data[dstIdx + 2] = img.data[srcIdx + 2];
                imgData.data[dstIdx + 3] = 255;
                srcIdx += 3;
                dstIdx += 4;
              }
            }
            ctx.putImageData(imgData, 0, 0);
            resolve(canvas);
          } else {
            resolve(null);
          }
        });
      });
    }
  }
  return null;
}

// Let's test extracting pages 3, 4, 91, 92, 93, 142, 143, 144, 195, 196, 197, 237, 238, 239, 541, 542, 543
async function runSampleCheck() {
  const outDir = path.resolve('scratch_sample_checks');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const testPages = [3, 4, 91, 92, 93, 142, 143, 144, 195, 196, 197, 237, 238, 239, 541, 542, 543, 811, 812, 813, 1043, 1044, 1045];
  for (const p of testPages) {
    const canvas = await extractPageImage(p);
    if (canvas) {
      fs.writeFileSync(path.join(outDir, `page_${p}.png`), canvas.toBuffer('image/png'));
      console.log(`Saved page ${p}`);
    }
  }
}

runSampleCheck().catch(console.error);
