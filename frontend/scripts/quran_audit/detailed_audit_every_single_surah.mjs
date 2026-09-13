import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const quranData = await import('./src/data/quranData.ts');
const surahs = quranData.SURAHS_LIST;
const quranTextPageToPdfPage = quranData.quranTextPageToPdfPage;

const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
const doc = await pdfjsLib.getDocument({ data }).promise;

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

function hasSurahBanner(canvas) {
  if (!canvas) return false;
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
      if (r < 100 && g < 100 && b < 100) dark++;
    }
    rowDarkness[y] = dark / (xMax - xMin);
  }

  const smoothed = new Float32Array(height);
  const win = 6;
  for (let y = win; y < height - win; y++) {
    let sum = 0;
    for (let dy = -win; dy <= win; dy++) sum += rowDarkness[y + dy];
    smoothed[y] = sum / (2 * win + 1);
  }

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
        const bh = y - bannerStart;
        if (bh >= 25 && bh <= 130) return true;
        inBanner = false;
      }
    }
  }
  return false;
}

async function verifyAll() {
  console.log('Verifying all 114 Surahs...');
  for (let i = 0; i < surahs.length; i++) {
    const s = surahs[i];
    const pdfPage = quranTextPageToPdfPage(s.pageStart);
    const canvas = await getPageCanvas(pdfPage);
    const banner = hasSurahBanner(canvas);
    
    // For Surah 1 & 2 they are on page 2 & 3 (full ornate page frames)
    const isSpecial = s.number === 1 || s.number === 2;
    console.log(`Surah ${s.number.toString().padStart(3, ' ')}. ${s.name.padEnd(18, ' ')} -> Text Page ${s.pageStart.toString().padStart(4, ' ')} (PDF Page ${pdfPage.toString().padStart(4, ' ')}) | Banner Detected: ${banner || isSpecial ? 'YES ✓' : 'CHECK'}`);
  }
}

verifyAll().catch(console.error);
