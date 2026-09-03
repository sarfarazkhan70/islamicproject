import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    const quranData = await import('./src/data/quranData.ts');
    const surahs = quranData.SURAHS_LIST;
    const pdfData = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
    const doc = await pdfjsLib.getDocument({ data: pdfData }).promise;

    console.log(`Doc loaded with ${doc.numPages} pages.`);
    console.log(`Auditing ${surahs.length} Surahs...`);

    const outDir = path.resolve('surah_audit');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    for (const s of surahs) {
      const page = await doc.getPage(s.pageStart);
      const ops = await page.getOperatorList();
      for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
          const objId = ops.argsArray[i][0];
          await new Promise((resolve) => {
            page.objs.get(objId, (img) => {
              if (img && img.data) {
                // Save thumbnail / small version
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
                const outPath = path.join(outDir, `surah_${String(s.number).padStart(3, '0')}_p${s.pageStart}_${s.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
                fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
              }
              resolve();
            });
          });
          break;
        }
      }
    }
    console.log('Finished rendering all 114 Surah pages into surah_audit/');
  } catch (err) {
    console.error('Error in main:', err);
  }
}

main();
