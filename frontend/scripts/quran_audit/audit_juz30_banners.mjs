import fs from 'fs';
import path from 'path';

// Let's inspect pages in juz30_crops and find all Surahs from Surah 78 (An-Naba) to 114 (An-Nas)
// Let's write a script that analyzes the images of pages 1085 to 1124 to list where every Surah starts!
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function auditJuz30() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  // Let's check pages 1085 to 1124
  for (let p = 1085; p <= 1124; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              let lineYs = [];
              for (let y = 70; y < img.height - 70; y++) {
                let dark = 0;
                for (let x = 200; x < 594; x++) {
                  const idx = (y * img.width + x) * 3;
                  if (img.data[idx] < 80 && img.data[idx+1] < 80 && img.data[idx+2] < 80) dark++;
                }
                if (dark > 340) lineYs.push(y);
              }

              let banners = [];
              for (let a = 0; a < lineYs.length; a++) {
                for (let b = a + 1; b < lineYs.length; b++) {
                  const diff = lineYs[b] - lineYs[a];
                  if (diff >= 45 && diff <= 115) {
                    const topY = lineYs[a];
                    if (!banners.some(bn => Math.abs(bn - topY) < 30)) {
                      banners.push(topY);
                    }
                  }
                }
              }
              if (banners.length > 0) {
                console.log(`Page ${p}: ${banners.length} banner(s) at Y: ${banners.join(', ')}`);
              }
            }
            resolve();
          });
        });
        break;
      }
    }
  }
}

auditJuz30().catch(console.error);
