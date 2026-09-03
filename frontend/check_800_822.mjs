import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Let's crop the top and bottom of PDF page 800 and PDF page 822 to see what is printed on them!
async function checkPages800and822() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  for (const p of [2, 3, 4, 799, 800, 801, 821, 822, 823]) {
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

              // Top 100px
              const topCanvas = createCanvas(img.width, 100);
              topCanvas.getContext('2d').drawImage(fullCanvas, 0, 0, img.width, 100, 0, 0, img.width, 100);
              fs.writeFileSync(`p${p}_top.png`, topCanvas.toBuffer('image/png'));

              // Bottom 100px
              const botCanvas = createCanvas(img.width, 100);
              botCanvas.getContext('2d').drawImage(fullCanvas, 0, img.height - 100, img.width, 100, 0, 0, img.width, 100);
              fs.writeFileSync(`p${p}_bot.png`, botCanvas.toBuffer('image/png'));
              console.log(`Saved p${p} top and bot`);
            }
            resolve();
          });
        });
        break;
      }
    }
  }
}

checkPages800and822().catch(console.error);
