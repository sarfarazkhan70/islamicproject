import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Let's print out text / information or render small slices of pages 1120-1124
async function check1120to1124() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  for (let p = 1120; p <= 1124; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            console.log(`Page ${p} image: ${img.width}x${img.height}`);
            resolve();
          });
        });
        break;
      }
    }
  }
}

check1120to1124().catch(console.error);
