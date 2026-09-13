import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

// Let's create an automated script that verifies all Surah locations by checking the headers and banners
async function buildAccurateSurahMap() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const outDir = path.resolve('surah_verify_crops');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Let's inspect all pages that have Surah banners or header changes
  // We can render a 800x120 crop of each candidate page's header + any detected banner inside
  const candidatesData = JSON.parse(fs.readFileSync('detected_surah_pages.json', 'utf8'));
  const pages = candidatesData.pages;

  console.log(`Processing ${pages.length} candidate pages...`);

  const results = [];

  for (const p of pages) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              const canvas = createCanvas(img.width, 100);
              const ctx = canvas.getContext('2d');
              const imgData = ctx.createImageData(img.width, 100);
              
              let srcIdx = 0;
              let dstIdx = 0;
              for (let y = 0; y < 100; y++) {
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
              fs.writeFileSync(path.join(outDir, `header_p${String(p).padStart(4, '0')}.png`), canvas.toBuffer('image/png'));
            }
            resolve();
          });
        });
        break;
      }
    }
  }

  console.log('Saved candidate header crops.');
}

buildAccurateSurahMap().catch(console.error);
