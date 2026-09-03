import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function cropPageCorners() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const testPages = [2, 3, 4, 5, 6, 7, 8, 9, 10, 40, 41, 42, 43, 76, 77, 78, 79, 80];
  const outDir = path.resolve('corner_crops');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const p of testPages) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              const fullCanvas = createCanvas(img.width, img.height);
              const fullCtx = fullCanvas.getContext('2d');
              const imgData = fullCtx.createImageData(img.width, img.height);
              let sIdx = 0;
              let dIdx = 0;
              for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                  imgData.data[dIdx] = img.data[sIdx];
                  imgData.data[dIdx + 1] = img.data[sIdx + 1];
                  imgData.data[dIdx + 2] = img.data[sIdx + 2];
                  imgData.data[dIdx + 3] = 255;
                  sIdx += 3;
                  dIdx += 4;
                }
              }
              fullCtx.putImageData(imgData, 0, 0);

              // Top strip (height 100)
              const stripCanvas = createCanvas(img.width, 100);
              const stripCtx = stripCanvas.getContext('2d');
              stripCtx.drawImage(fullCanvas, 0, 0, img.width, 100, 0, 0, img.width, 100);
              fs.writeFileSync(path.join(outDir, `p${p}_top_strip.png`), stripCanvas.toBuffer('image/png'));

              // Bottom strip (height 100)
              const botCanvas = createCanvas(img.width, 100);
              const botCtx = botCanvas.getContext('2d');
              botCtx.drawImage(fullCanvas, 0, img.height - 100, img.width, 100, 0, 0, img.width, 100);
              fs.writeFileSync(path.join(outDir, `p${p}_bot_strip.png`), botCanvas.toBuffer('image/png'));
            }
            resolve();
          });
        });
        break;
      }
    }
  }
  console.log('Saved corner strips');
}

cropPageCorners().catch(console.error);
