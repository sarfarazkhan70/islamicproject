import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
const doc = await pdfjsLib.getDocument({ data }).promise;

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

// Function to detect actual ornate Surah banners
function findOrnateBanners(canvas) {
  if (!canvas) return [];
  const ctx = canvas.getContext('2d');
  const { width, height, data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // We check the inner 70% width: x from 15% to 85%
  const xMin = Math.floor(width * 0.18);
  const xMax = Math.floor(width * 0.82);
  const span = xMax - xMin;

  // For each row y, check continuity of dark pixels (how long is the longest uninterrupted dark run, or dark ratio)
  const rowDarkRatio = new Float32Array(height);
  const rowMaxRun = new Int32Array(height);

  for (let y = 0; y < height; y++) {
    let darkCount = 0;
    let maxRun = 0;
    let curRun = 0;
    for (let x = xMin; x < xMax; x++) {
      const idx = (y * width + x) * 4;
      const isDark = (data[idx] < 90 && data[idx+1] < 90 && data[idx+2] < 90);
      if (isDark) {
        darkCount++;
        curRun++;
        if (curRun > maxRun) maxRun = curRun;
      } else {
        curRun = 0;
      }
    }
    rowDarkRatio[y] = darkCount / span;
    rowMaxRun[y] = maxRun;
  }

  // An ornate banner has:
  // 1. High average row darkness (> 0.35) over at least 35-90 vertical pixels
  // 2. Contains continuous dark border lines (maxRun > 60% of span)
  const banners = [];
  let inBanner = false;
  let bannerStart = 0;
  let totalDarkArea = 0;
  let maxRunInBanner = 0;

  for (let y = 90; y < height - 90; y++) {
    // Check if row has banner-like density
    const isBannerRow = rowDarkRatio[y] > 0.36 || (rowDarkRatio[y] > 0.28 && rowMaxRun[y] > span * 0.4);

    if (isBannerRow) {
      if (!inBanner) {
        inBanner = true;
        bannerStart = y;
        totalDarkArea = 0;
        maxRunInBanner = 0;
      }
      totalDarkArea += rowDarkRatio[y];
      if (rowMaxRun[y] > maxRunInBanner) maxRunInBanner = rowMaxRun[y];
    } else {
      if (inBanner) {
        const bh = y - bannerStart;
        if (bh >= 32 && bh <= 120 && maxRunInBanner > span * 0.45 && totalDarkArea > 15) {
          banners.push({ yStart: bannerStart, yEnd: y, height: bh, area: totalDarkArea, maxRun: maxRunInBanner });
        }
        inBanner = false;
      }
    }
  }

  return banners;
}

async function run() {
  console.log('Testing banner detector on known pages...');
  const testPages = [2, 3, 92, 144, 197, 240, 542, 543, 812, 813, 1043, 1044, 1121, 1122, 1123];
  for (const p of testPages) {
    const canvas = await getPageCanvas(p);
    const banners = findOrnateBanners(canvas);
    console.log(`Page ${p}: found ${banners.length} banners:`, banners);
  }
}

run().catch(console.error);
