import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function findAllSurahBanners() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const outDir = path.resolve('scratch/all_surah_headers_extracted');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const greenCovers = [
    1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
    373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
    743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
  ];

  const bannerList = [];

  // Surah 1 is page 3, Surah 2 is page 4
  bannerList.push({ page: 3, y: 0, surahIndex: 1, name: 'Al-Fatihah' });
  bannerList.push({ page: 4, y: 0, surahIndex: 2, name: 'Al-Baqarah' });

  for (let p = 5; p <= 1123; p++) {
    if (greenCovers.includes(p)) continue;

    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();

    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              // Find horizontal bars that define the banner box
              // In this PDF, banners have top border and bottom border where darkCount across x=200..600 is high
              const barRows = [];
              for (let y = 50; y < img.height - 50; y++) {
                let darkCount = 0;
                for (let x = 200; x < 600; x++) {
                  const idx = (y * img.width + x) * 3;
                  const r = img.data[idx];
                  const g = img.data[idx + 1];
                  const b = img.data[idx + 2];
                  if (r < 70 && g < 70 && b < 70) darkCount++;
                }
                if (darkCount > 340) { // solid black border line across 400px width
                  barRows.push(y);
                }
              }

              // Group consecutive rows into lines
              const lines = [];
              let currentGroup = [];
              for (const r of barRows) {
                if (currentGroup.length === 0 || r === currentGroup[currentGroup.length - 1] + 1) {
                  currentGroup.push(r);
                } else {
                  lines.push(Math.round(currentGroup.reduce((a, b) => a + b) / currentGroup.length));
                  currentGroup = [r];
                }
              }
              if (currentGroup.length > 0) {
                lines.push(Math.round(currentGroup.reduce((a, b) => a + b) / currentGroup.length));
              }

              // Check pairs of lines separated by 40 to 120 pixels (the height of a Surah banner)
              for (let a = 0; a < lines.length; a++) {
                for (let b = a + 1; b < lines.length; b++) {
                  const h = lines[b] - lines[a];
                  if (h >= 45 && h <= 110) {
                    bannerList.push({ page: p, topY: lines[a], bottomY: lines[b], height: h });
                    
                    // Crop the banner and save
                    const canvas = createCanvas(img.width, h + 20);
                    const ctx = canvas.getContext('2d');
                    const imgData = ctx.createImageData(img.width, h + 20);
                    let dstIdx = 0;
                    const startY = Math.max(0, lines[a] - 10);
                    for (let y = startY; y < startY + h + 20 && y < img.height; y++) {
                      for (let x = 0; x < img.width; x++) {
                        const srcIdx = (y * img.width + x) * 3;
                        imgData.data[dstIdx] = img.data[srcIdx];
                        imgData.data[dstIdx + 1] = img.data[srcIdx + 1];
                        imgData.data[dstIdx + 2] = img.data[srcIdx + 2];
                        imgData.data[dstIdx + 3] = 255;
                        dstIdx += 4;
                      }
                    }
                    ctx.putImageData(imgData, 0, 0);
                    fs.writeFileSync(path.join(outDir, `banner_p${String(p).padStart(4, '0')}_y${lines[a]}.png`), canvas.toBuffer('image/png'));
                    break;
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

  console.log(`Found ${bannerList.length} banners.`);
  fs.writeFileSync('scratch/exact_banner_list.json', JSON.stringify(bannerList, null, 2));
}

findAllSurahBanners().catch(console.error);
