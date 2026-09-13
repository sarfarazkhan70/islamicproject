import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Let's import current SURAHS_LIST and conversion functions
const quranData = await import('./src/data/quranData.ts');
const surahs = quranData.SURAHS_LIST;
const quranTextPageToPdfPage = quranData.quranTextPageToPdfPage;
const pdfPageToQuranTextPage = quranData.pdfPageToQuranTextPage;

console.log('Total Surahs:', surahs.length);

// Let's load the PDF
const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
const doc = await pdfjsLib.getDocument({ data }).promise;
console.log('PDF loaded, total physical pages:', doc.numPages);

// Helper to extract image data from a page
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

// Function to find ornate Surah heading banners on a canvas
// In 9-line Mushafs, Surah header banners are thick horizontal decorative borders across the middle or top of lines
function findSurahBannersOnCanvas(canvas) {
  if (!canvas) return [];
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { width, height, data } = imgData;

  // Search horizontal band darkness (x from 15% to 85% width)
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
      if (r < 100 && g < 100 && b < 100) {
        dark++;
      }
    }
    rowDarkness[y] = dark / (xMax - xMin);
  }

  // Smooth
  const smoothed = new Float32Array(height);
  const win = 6;
  for (let y = win; y < height - win; y++) {
    let sum = 0;
    for (let dy = -win; dy <= win; dy++) sum += rowDarkness[y + dy];
    smoothed[y] = sum / (2 * win + 1);
  }

  // Find banner blocks where darkness is high for at least 30-80px vertically
  const banners = [];
  let inBanner = false;
  let bannerStart = 0;

  for (let y = 100; y < height - 100; y++) {
    if (smoothed[y] > 0.28) {
      if (!inBanner) {
        inBanner = true;
        bannerStart = y;
      }
    } else {
      if (inBanner) {
        const bannerHeight = y - bannerStart;
        if (bannerHeight >= 25 && bannerHeight <= 130) {
          banners.push({ yStart: bannerStart, yEnd: y, height: bannerHeight });
        }
        inBanner = false;
      }
    }
  }

  return banners;
}

// Let's analyze all 114 Surahs
console.log('Auditing Surah starting pages...');
const auditResults = [];

for (const s of surahs) {
  const currentTextPage = s.pageStart;
  const currentPdfPage = quranTextPageToPdfPage(currentTextPage);

  auditResults.push({
    number: s.number,
    name: s.name,
    arabicName: s.arabicName,
    textPage: currentTextPage,
    pdfPage: currentPdfPage
  });
}

console.log('Sample audit list:');
console.table(auditResults.slice(0, 15));
console.table(auditResults.slice(15, 30));
console.table(auditResults.slice(100, 114));
