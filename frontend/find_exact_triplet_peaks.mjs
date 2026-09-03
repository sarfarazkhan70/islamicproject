import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const vDir = path.resolve('verification');
const dirs = fs.readdirSync(vDir).filter(d => fs.statSync(path.join(vDir, d)).isDirectory()).sort();

function getRowDensityProfile(img) {
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const { width, height, data } = ctx.getImageData(0, 0, img.width, img.height);

  const xMin = Math.floor(width * 0.15);
  const xMax = Math.floor(width * 0.85);
  const rowDarkness = new Float32Array(height);

  for (let y = 0; y < height; y++) {
    let dark = 0;
    for (let x = xMin; x < xMax; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (r < 120 && g < 120 && b < 120) dark++;
    }
    rowDarkness[y] = dark / (xMax - xMin);
  }

  // Smooth
  const smoothed = new Float32Array(height);
  const win = 4;
  for (let y = win; y < height - win; y++) {
    let sum = 0;
    for (let dy = -win; dy <= win; dy++) sum += rowDarkness[y + dy];
    smoothed[y] = sum / (2 * win + 1);
  }

  // Find the highest peak in the middle 80% of height (between y=100 and y=height-100)
  let maxPeak = 0;
  let peakY = 0;
  for (let y = 100; y < height - 100; y++) {
    if (smoothed[y] > maxPeak) {
      maxPeak = smoothed[y];
      peakY = y;
    }
  }

  // Calculate width of peak (how thick the banner band is where smoothed > 0.22)
  let bandThickness = 0;
  for (let y = 100; y < height - 100; y++) {
    if (smoothed[y] > 0.22) bandThickness++;
  }

  return { maxPeak, peakY, bandThickness };
}

async function findExactPages() {
  const results = [];

  for (const dir of dirs) {
    const dirPath = path.join(vDir, dir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.png')).sort((a,b) => {
      const na = parseInt(a.replace(/\D/g, ''), 10);
      const nb = parseInt(b.replace(/\D/g, ''), 10);
      return na - nb;
    });

    const surahNum = parseInt(dir.split('-')[0], 10);
    const surahName = dir.substring(4);

    if (surahNum === 1) {
      results.push({ surahNum, surahName, physicalPdfPage: 2, reason: 'Al-Fatihah' });
      continue;
    }
    if (surahNum === 2) {
      results.push({ surahNum, surahName, physicalPdfPage: 3, reason: 'Al-Baqarah' });
      continue;
    }

    const fileScores = [];
    for (const f of files) {
      const pageNum = parseInt(f.replace(/\D/g, ''), 10);
      const img = await loadImage(path.join(dirPath, f));
      const profile = getRowDensityProfile(img);
      fileScores.push({ pageNum, ...profile });
    }

    // A Surah banner has the highest maxPeak and thickest band
    fileScores.sort((a,b) => (b.maxPeak * 1.5 + b.bandThickness * 0.01) - (a.maxPeak * 1.5 + a.bandThickness * 0.01));
    const winner = fileScores[0];

    results.push({
      surahNum,
      surahName,
      physicalPdfPage: winner.pageNum,
      winner,
      all: fileScores
    });
  }

  fs.writeFileSync('exact_triplet_results.json', JSON.stringify(results, null, 2));
  console.log('Saved exact_triplet_results.json');
}

findExactPages().catch(console.error);
