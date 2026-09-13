import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function checkLastPages() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  for (let p = 1118; p <= 1124; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              // Find all banners on this page
              let darkRows = [];
              for (let y = 50; y < img.height - 50; y++) {
                let darkCount = 0;
                for (let x = 180; x < 610; x++) {
                  const idx = (y * img.width + x) * 3;
                  if (img.data[idx] < 80 && img.data[idx+1] < 80 && img.data[idx+2] < 80) darkCount++;
                }
                if (darkCount > 340) darkRows.push(y);
              }
              let banners = [];
              for (let a = 0; a < darkRows.length; a++) {
                for (let b = a + 1; b < darkRows.length; b++) {
                  const diff = darkRows[b] - darkRows[a];
                  if (diff >= 45 && diff <= 115) {
                    const topY = darkRows[a];
                    if (!banners.some(bn => Math.abs(bn - topY) < 35)) {
                      banners.push(topY);
                    }
                  }
                }
              }
              console.log(`Page ${p}: Found ${banners.length} banner(s) at Y: [${banners.join(', ')}]`);
            }
            resolve();
          });
        });
        break;
      }
    }
  }
}

checkLastPages().catch(console.error);
