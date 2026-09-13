import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

async function testJuzStarts() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const outDir = path.resolve('juz_find');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Let's render pages: 3, 4, 38, 39, 40, 41, 74, 75, 76, 77, 110, 111, 112, 113, 147, 148, 149, 150
  const testPages = [
    3, 4,
    38, 39, 40, 41, 42,
    74, 75, 76, 77, 78,
    110, 111, 112, 113, 114,
    147, 148, 149, 150, 151
  ];

  for (const pageNum of testPages) {
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
              const outPath = path.join(outDir, `page_${String(pageNum).padStart(4, '0')}.png`);
              fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
            }
            resolve();
          });
        });
        break;
      }
    }
  }
  console.log('Saved test Juz pages');
}

testJuzStarts().catch(console.error);
