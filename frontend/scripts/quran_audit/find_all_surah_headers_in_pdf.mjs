import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Load PDF
const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
const doc = await pdfjsLib.getDocument({ data }).promise;
console.log('PDF loaded, total physical pages:', doc.numPages);

// Cover pages array
const PARA_COVER_PDF_PAGES = [
  1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
  373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
  743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
];

async function getPageCanvas(pageNum) {
  const page = await doc.getPage(pageNum);
  const ops = await page.getOperatorList();
  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
      const objId = ops.argsArray[i][0];
      return new Promise((resolve) => {
        page.objs.get(objId, (img) => {
          if (!img || !img.data) return resolve(null);
          const canvas = createCanvas(img.width, img.height);
          const ctx = canvas.getContext('2d');
          const imgData = ctx.createImageData(img.width, img.height);
          let sIdx = 0;
          let dIdx = 0;
          for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
              imgData.data[dIdx] = img.data[sIdx];
              imgData.data[dIdx + 1] = img.data[sIdx + 1];
              imgData.data[dIdx + 2] = img.data[sIdx + 2];
              imgData.data[dIdx + 3] = 255;
              sIdx += 3;
              dIdx += 4;
            }
          }
          ctx.putImageData(imgData, 0, 0);
          resolve(canvas);
        });
      });
    }
  }
  return null;
}

// Banner detection algorithm
function detectBanners(canvas) {
  if (!canvas) return [];
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { width, height, data } = imgData;

  const xMin = Math.floor(width * 0.15);
  const xMax = Math.floor(width * 0.85);
  const rowDarkness = new Float32Array(height);

  for (let y = 0; y < height; y++) {
    let dark = 0;
    for (let x = xMin; x < xMax; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r < 110 && g < 110 && b < 110) dark++;
    }
    rowDarkness[y] = dark / (xMax - xMin);
  }

  // Smooth with window 5
  const smoothed = new Float32Array(height);
  const win = 5;
  for (let y = win; y < height - win; y++) {
    let sum = 0;
    for (let dy = -win; dy <= win; dy++) sum += rowDarkness[y + dy];
    smoothed[y] = sum / (2 * win + 1);
  }

  const banners = [];
  let inBanner = false;
  let bannerStart = 0;

  for (let y = 80; y < height - 80; y++) {
    if (smoothed[y] > 0.26) {
      if (!inBanner) {
        inBanner = true;
        bannerStart = y;
      }
    } else {
      if (inBanner) {
        const bh = y - bannerStart;
        if (bh >= 22 && bh <= 140) {
          banners.push({ yStart: bannerStart, yEnd: y, height: bh });
        }
        inBanner = false;
      }
    }
  }
  return banners;
}

async function scanAllPages() {
  console.log('Scanning all 1124 physical PDF pages for Surah banners...');
  const pagesWithBanners = [];

  for (let p = 1; p <= doc.numPages; p++) {
    if (PARA_COVER_PDF_PAGES.includes(p)) continue;
    const canvas = await getPageCanvas(p);
    if (!canvas) continue;

    // Special pages: p=2 (Surah 1: Al-Fatihah), p=3 (Surah 2: Al-Baqarah)
    if (p === 2) {
      pagesWithBanners.push({ physicalPdfPage: 2, bannerCount: 1, note: 'Surah 1 Al-Fatihah' });
      continue;
    }
    if (p === 3) {
      pagesWithBanners.push({ physicalPdfPage: 3, bannerCount: 1, note: 'Surah 2 Al-Baqarah' });
      continue;
    }

    const banners = detectBanners(canvas);
    if (banners.length > 0) {
      pagesWithBanners.push({ physicalPdfPage: p, bannerCount: banners.length, banners });
    }
  }

  console.log(`Found ${pagesWithBanners.length} pages with Surah banners!`);
  fs.writeFileSync('detected_surah_pages.json', JSON.stringify(pagesWithBanners, null, 2));
}

scanAllPages().catch(console.error);
