import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

async function mapAllSurahs() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const outDir = path.resolve('surah_banners_verified');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const greenCovers = [
    1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
    373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
    743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
  ];

  const detectedBanners = [];

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
                detectedBanners.push({ page: 3, surahIndex: 1, nameHint: 'Al-Fatihah' });
              } else if (p === 4) {
                detectedBanners.push({ page: 4, surahIndex: 2, nameHint: 'Al-Baqarah' });
              } else {
                let candidateY = [];
                for (let y = 80; y < img.height - 80; y++) {
                  let darkCount = 0;
                  for (let x = 190; x < 600; x++) {
                    const idx = (y * img.width + x) * 3;
                    const r = img.data[idx];
                    const g = img.data[idx + 1];
                    const b = img.data[idx + 2];
                    if (r < 75 && g < 75 && b < 75) darkCount++;
                  }
                  if (darkCount > 340) {
                    candidateY.push(y);
                  }
                }

                if (candidateY.length >= 2) {
                  for (let a = 0; a < candidateY.length; a++) {
                    for (let b = a + 1; b < candidateY.length; b++) {
                      const h = candidateY[b] - candidateY[a];
                      if (h >= 45 && h <= 120) {
                        detectedBanners.push({
                          page: p,
                          topY: candidateY[a],
                          bottomY: candidateY[b],
                          height: h
                        });
                        break;
                      }
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

  const uniquePages = Array.from(new Set(detectedBanners.map(b => b.page)));
  console.log(`Detected ${uniquePages.length} unique pages with Surah banners:`, uniquePages);
  fs.writeFileSync('detected_surah_pages.json', JSON.stringify({ count: uniquePages.length, pages: uniquePages }, null, 2));
}

mapAllSurahs().catch(console.error);
