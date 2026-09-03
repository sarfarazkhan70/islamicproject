import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function extractPageImages() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const outDir = path.resolve('scratch/page_crops');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const pagesToExtract = [1, 2, 3, 4, 5, 40, 41, 42, 91, 92, 93, 142, 143, 541, 542, 811, 812, 1043, 1044, 1123, 1124];

  for (const p of pagesToExtract) {
    const page = await doc.getPage(p);
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
              let src = 0;
              let dst = 0;
              for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                  imgData.data[dst] = img.data[src];
                  imgData.data[dst + 1] = img.data[src + 1];
                  imgData.data[dst + 2] = img.data[src + 2];
                  imgData.data[dst + 3] = 255;
                  src += 3;
                  dst += 4;
                }
              }
              ctx.putImageData(imgData, 0, 0);
              fs.writeFileSync(path.join(outDir, `page_${String(p).padStart(4, '0')}.png`), canvas.toBuffer('image/png'));
              console.log(`Saved image for PDF page ${p} (${img.width}x${img.height})`);
            }
            resolve();
          });
        });
        break;
      }
    }
  }
}

extractPageImages().catch(console.error);
