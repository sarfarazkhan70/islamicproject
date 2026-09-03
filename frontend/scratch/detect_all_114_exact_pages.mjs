import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Let's scan all pages from 3 to 1123, look for the "سورة ..." text / box or header and extract the exact page for every Surah!
async function detectAll114Surahs() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const outDir = path.resolve('scratch/all_114_surah_headers');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const greenCovers = [
    1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
    373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
    743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
  ];

  const foundStarts = [];

  // Page 3 is Surah 1
  foundStarts.push({ page: 3, surah: 1, note: 'Al-Fatihah' });
  // Page 4 is Surah 2
  foundStarts.push({ page: 4, surah: 2, note: 'Al-Baqarah' });

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
              // Find horizontal bars with solid dark lines across x=200..600
              const barRows = [];
              for (let y = 60; y < img.height - 60; y++) {
                let darkCount = 0;
                for (let x = 200; x < 600; x++) {
                  const idx = (y * img.width + x) * 3;
                  if (img.data[idx] < 70 && img.data[idx+1] < 70 && img.data[idx+2] < 70) {
                    darkCount++;
                  }
                }
                if (darkCount > 340) barRows.push(y);
              }

              // Group consecutive rows
              const lines = [];
              let cur = [];
              for (const r of barRows) {
                if (cur.length === 0 || r === cur[cur.length - 1] + 1) cur.push(r);
                else {
                  lines.push(Math.round(cur.reduce((a, b) => a + b) / cur.length));
                  cur = [r];
                }
              }
              if (cur.length > 0) lines.push(Math.round(cur.reduce((a, b) => a + b) / cur.length));

              for (let a = 0; a < lines.length; a++) {
                for (let b = a + 1; b < lines.length; b++) {
                  const h = lines[b] - lines[a];
                  // In this Mushaf, Surah banner has height between 48 and 105
                  if (h >= 48 && h <= 105) {
                    // Check if inside this box there is dark content (the text of the Surah header)
                    let boxDarkCount = 0;
                    const midYStart = lines[a] + 10;
                    const midYEnd = lines[b] - 10;
                    for (let y = midYStart; y < midYEnd; y++) {
                      for (let x = 250; x < 550; x++) {
                        const idx = (y * img.width + x) * 3;
                        if (img.data[idx] < 70 && img.data[idx+1] < 70 && img.data[idx+2] < 70) {
                          boxDarkCount++;
                        }
                      }
                    }

                    if (boxDarkCount > 300) {
                      foundStarts.push({ page: p, topY: lines[a], bottomY: lines[b], height: h });
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

  // Deduplicate by page, keeping the first banner if multiple exist on the same page
  const pageMap = new Map();
  for (const s of foundStarts) {
    if (!pageMap.has(s.page)) {
      pageMap.set(s.page, []);
    }
    pageMap.get(s.page).push(s);
  }

  console.log('Total unique pages with Surah banners:', pageMap.size);
  const result = Array.from(pageMap.keys()).sort((a,b) => a - b);
  console.log(JSON.stringify(result));
  fs.writeFileSync('scratch/exact_detected_pages.json', JSON.stringify({ count: result.length, pages: result }, null, 2));
}

detectAll114Surahs().catch(console.error);
