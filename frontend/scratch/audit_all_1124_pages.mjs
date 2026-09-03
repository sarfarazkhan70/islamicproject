import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';

async function auditAllPages() {
  console.log('Loading public/quran/quran.pdf...');
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  console.log(`PDF has ${doc.numPages} pages.`);

  const surahBannersFound = [];

  // Iterate over all 1124 pages
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    let imgData = null;

    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              imgData = img;
            }
            resolve();
          });
        });
        break;
      }
    }

    if (!imgData) continue;

    // Scan for horizontal dark bands characteristic of Surah header frames
    // In this 9-line Mushaf, image is approx 793x1123
    const width = imgData.width;
    const height = imgData.height;
    const barRows = [];

    // Header frames occur between y=40 and y=height-50
    // They span horizontally from x=150 to x=640 with dark pixels
    for (let y = 40; y < height - 50; y++) {
      let darkCount = 0;
      for (let x = 200; x < 600; x++) {
        const idx = (y * width + x) * 3;
        const r = imgData.data[idx];
        const g = imgData.data[idx + 1];
        const b = imgData.data[idx + 2];
        if (r < 75 && g < 75 && b < 75) darkCount++;
      }
      if (darkCount > 330) {
        barRows.push(y);
      }
    }

    // Cluster continuous rows into horizontal lines
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

    // Find banner pairs (top border and bottom border separated by 45..120 px)
    let bannerCount = 0;
    for (let a = 0; a < lines.length; a++) {
      for (let b = a + 1; b < lines.length; b++) {
        const h = lines[b] - lines[a];
        if (h >= 45 && h <= 120) {
          bannerCount++;
          break;
        }
      }
    }

    // Page 3 is Al-Fatihah, Page 4 is Al-Baqarah (which has opening ornamental layout)
    if (p === 3 || p === 4 || bannerCount > 0) {
      surahBannersFound.push({ page: p, bannerCount: p === 3 || p === 4 ? 1 : bannerCount });
    }

    if (p % 100 === 0 || p === 1124) {
      console.log(`Audited ${p} / 1124 pages... Found ${surahBannersFound.length} pages with banners so far.`);
    }
  }

  console.log('\n--- Surah Banner Audit Complete ---');
  console.log(`Total candidate pages with banners: ${surahBannersFound.length}`);
  fs.writeFileSync('scratch/audit_results.json', JSON.stringify(surahBannersFound, null, 2));
}

auditAllPages().catch(console.error);
