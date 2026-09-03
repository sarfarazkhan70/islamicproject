import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

// Let's create an automated script to verify the exact page for all 114 Surahs:
// We will search for Surah banners across all pages.
// In 9-line Mushaf, when a Surah begins, there is a banner containing the Surah title.
// Let's find all pages with a Surah banner and save their images to verify!

async function extractAllSurahBanners() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const outDir = path.resolve('all_surah_banners');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const greenCovers = [
    1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
    373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
    743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
  ];

  const results = [];

  for (let p = 3; p <= 1123; p++) {
    if (greenCovers.includes(p)) continue;
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              if (p === 3) {
                results.push({ page: 3, surah: 1, name: 'Al-Fatihah' });
              } else if (p === 4) {
                results.push({ page: 4, surah: 2, name: 'Al-Baqarah' });
              } else {
                // Check if page contains the word "سورة" banner or title box
                // A Surah title box has horizontal borders
                let lineYs = [];
                for (let y = 80; y < img.height - 80; y++) {
                  let dark = 0;
                  for (let x = 200; x < 594; x++) {
                    const idx = (y * img.width + x) * 3;
                    if (img.data[idx] < 70 && img.data[idx+1] < 70 && img.data[idx+2] < 70) {
                      dark++;
                    }
                  }
                  if (dark > 350) {
                    lineYs.push(y);
                  }
                }

                // If lineYs has clusters with spacing 40-120
                for (let a = 0; a < lineYs.length; a++) {
                  for (let b = a + 1; b < lineYs.length; b++) {
                    const diff = lineYs[b] - lineYs[a];
                    if (diff >= 45 && diff <= 110) {
                      // Found banner
                      results.push({ page: p, topY: lineYs[a], bottomY: lineYs[b] });
                      
                      // Save banner crop
                      const canvas = createCanvas(img.width, diff + 30);
                      const ctx = canvas.getContext('2d');
                      const imgData = ctx.createImageData(img.width, diff + 30);
                      const startY = Math.max(0, lineYs[a] - 15);
                      let srcIdx = startY * img.width * 3;
                      let dstIdx = 0;
                      for (let y = 0; y < diff + 30 && (startY + y) < img.height; y++) {
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
                      fs.writeFileSync(path.join(outDir, `banner_p${p}_y${lineYs[a]}.png`), canvas.toBuffer('image/png'));
                      break;
                    }
                  }
                }
              }
            }
            resolve();
          });
        });
        break;
      }
    }
  }

  // Deduplicate by page
  const pages = Array.from(new Set(results.map(r => r.page)));
  console.log(`Found banners on ${pages.length} pages.`);
  fs.writeFileSync('surah_banner_pages.json', JSON.stringify(pages, null, 2));
}

extractAllSurahBanners().catch(console.error);
