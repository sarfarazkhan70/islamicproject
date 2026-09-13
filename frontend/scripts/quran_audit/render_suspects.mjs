import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

// Render full-page images for suspect ranges and short surahs
async function renderSuspectRanges() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const pagesToRender = [
    // Surah 3/4
    142, 143, 144, 145,
    // Surah 4/5
    194, 195, 196, 197,
    // Surah 5/6
    237, 238, 239, 240,
    // Surah 8/9
    347, 348, 349, 350,
    // Surah 17/18
    540, 541, 542, 543,
    // Surah 18/19
    562, 563, 564, 565,
    // Surah 25/26
    676, 677, 678, 679,
    // Surah 26/27
    695, 696, 697, 698,
    // Surah 33/34
    788, 789, 790, 791,
    // Surah 35/36
    810, 811, 812, 813,
    // Surah 40/41
    880, 881, 882, 883,
    // Surah 47/48
    944, 945, 946, 947,
    // Surah 48/49
    952, 953, 954, 955,
    // Surah 58/59
    1008, 1009, 1010, 1011,
    // Surah 62/63
    1024, 1025, 1026, 1027,
    // Surah 66/67
    1043, 1044, 1045,
    // Surah 72/73
    1063, 1064, 1065, 1066,
    // Surah 77/78
    1083, 1084, 1085, 1086,
    // Short Surahs 87..114
    1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1113, 1114, 1115, 1116, 1117, 1118, 1119, 1120, 1121, 1122, 1123, 1124
  ];

  const uniquePages = Array.from(new Set(pagesToRender)).sort((a, b) => a - b);
  const outDir = path.resolve('suspect_renders');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const p of uniquePages) {
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
              fs.writeFileSync(path.join(outDir, `page_${p}.png`), canvas.toBuffer('image/png'));
            }
            resolve();
          });
        });
        break;
      }
    }
  }

  console.log(`Rendered ${uniquePages.length} pages in suspect_renders/`);
}

renderSuspectRanges().catch(console.error);
