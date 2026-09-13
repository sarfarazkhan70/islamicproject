import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function extractSampleCorners() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const testPages = [
    2, 3, 4, 38, 39, 40, 41, 42,
    75, 76, 77, 78, 79,
    113, 114, 115, 116,
    150, 151, 152, 153,
    540, 541, 542, 543, 544,
    810, 811, 812, 813, 814,
    1083, 1084, 1085, 1086
  ];

  const outDir = path.resolve('para_boundary_crops');
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
              // Crop top 80px and bottom 80px
              const canvas = createCanvas(img.width, 160);
              const ctx = canvas.getContext('2d');
              const imgData = ctx.createImageData(img.width, img.height);
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
              const fullCanvas = createCanvas(img.width, img.height);
              fullCanvas.getContext('2d').putImageData(imgData, 0, 0);

              // Top 80px
              ctx.drawImage(fullCanvas, 0, 0, img.width, 80, 0, 0, img.width, 80);
              // Bottom 80px
              ctx.drawImage(fullCanvas, 0, img.height - 80, img.width, 80, 0, 80, img.width, 80);

              fs.writeFileSync(path.join(outDir, `p${p}_header_footer.png`), canvas.toBuffer('image/png'));
              console.log(`Saved p${p}_header_footer.png`);
            }
            resolve();
          });
        });
        break;
      }
    }
  }
}

extractSampleCorners().catch(console.error);
