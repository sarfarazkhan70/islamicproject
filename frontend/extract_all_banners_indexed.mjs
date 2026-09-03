import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

const greenCovers = [
  1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
  373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
  743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
];

async function extractEveryBanner() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const outDir = path.resolve('all_banners_indexed');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const banners = [];

  for (let p = 3; p <= 1124; p++) {
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
                // Page 3 is Al-Fatihah
                banners.push({ page: 3, y: 0, label: 'Al-Fatihah' });
              } else if (p === 4) {
                // Page 4 is Al-Baqarah
                banners.push({ page: 4, y: 0, label: 'Al-Baqarah' });
              } else {
                // Look for banners
                // In Zia-ul-Quran, the banner has two heavy horizontal lines across the page width
                let darkRows = [];
                for (let y = 70; y < img.height - 70; y++) {
                  let darkCount = 0;
                  for (let x = 180; x < 610; x++) {
                    const idx = (y * img.width + x) * 3;
                    if (img.data[idx] < 70 && img.data[idx + 1] < 70 && img.data[idx + 2] < 70) {
                      darkCount++;
                    }
                  }
                  if (darkCount > 340) {
                    darkRows.push(y);
                  }
                }

                // Find top & bottom line of banners
                let pageBanners = [];
                for (let a = 0; a < darkRows.length; a++) {
                  for (let b = a + 1; b < darkRows.length; b++) {
                    const diff = darkRows[b] - darkRows[a];
                    if (diff >= 45 && diff <= 115) {
                      const topY = darkRows[a];
                      const bottomY = darkRows[b];
                      if (!pageBanners.some(pb => Math.abs(pb.topY - topY) < 35)) {
                        pageBanners.push({ topY, bottomY, diff });
                      }
                    }
                  }
                }

                for (const pb of pageBanners) {
                  banners.push({ page: p, y: pb.topY, height: pb.diff });
                  // Save cropped image of the banner + bismillah
                  const cropHeight = Math.min(pb.diff + 80, img.height - pb.topY);
                  const startY = Math.max(0, pb.topY - 10);
                  const canvas = createCanvas(img.width, cropHeight);
                  const ctx = canvas.getContext('2d');
                  const imgData = ctx.createImageData(img.width, cropHeight);

                  let srcIdx = startY * img.width * 3;
                  let dstIdx = 0;
                  for (let y = 0; y < cropHeight; y++) {
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
                  const outName = `banner_p${String(p).padStart(4, '0')}_y${pb.topY}.png`;
                  fs.writeFileSync(path.join(outDir, outName), canvas.toBuffer('image/png'));
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

  console.log(`Total banners found: ${banners.length}`);
  fs.writeFileSync('all_banners_found.json', JSON.stringify(banners, null, 2));
}

extractEveryBanner().catch(console.error);
