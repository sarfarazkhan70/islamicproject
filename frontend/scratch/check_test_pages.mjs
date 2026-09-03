import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function checkPages() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const testPages = [541, 542, 543, 811, 812, 813, 814, 982, 983, 984, 985, 986];
  for (const p of testPages) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    // Count images
    let imgCount = 0;
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        imgCount++;
      }
    }
    console.log(`Page ${p}: ops length=${ops.fnArray.length}, images=${imgCount}`);
  }
}

checkPages().catch(console.error);
