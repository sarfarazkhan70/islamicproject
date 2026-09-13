import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const vDir = path.resolve('verification');
const dirs = fs.readdirSync(vDir).filter(d => fs.statSync(path.join(vDir, d)).isDirectory()).sort();

console.log(`Auditing ${dirs.length} Surah folders in verification/...`);

// In a 9-line Mushaf, a Surah banner has a distinct thick horizontal decorative pattern:
// Height: 35px to 95px
// Darkness in the center box: very high
// Horizontal extent: spans across 70%+ of page width
function analyzeImage(img) {
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
      if (r < 100 && g < 100 && b < 100) dark++;
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

  let maxBannerScore = 0;
  let inBanner = false;
  let bannerStart = 0;

  for (let y = 100; y < height - 100; y++) {
    if (smoothed[y] > 0.38) { // Distinct high density threshold for ornate frame
      if (!inBanner) {
        inBanner = true;
        bannerStart = y;
      }
    } else {
      if (inBanner) {
        const bh = y - bannerStart;
        if (bh >= 30 && bh <= 110) {
          // Calculate area
          let area = 0;
          for (let py = bannerStart; py < y; py++) area += smoothed[py];
          if (area > maxBannerScore) maxBannerScore = area;
        }
        inBanner = false;
      }
    }
  }

  return maxBannerScore;
}

async function auditFolders() {
  const mismatches = [];
  const exactMapping = [];

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
      exactMapping.push({ surahNum, surahName, physicalPdfPage: 2, confidence: 'Manual: Page 2' });
      continue;
    }
    if (surahNum === 2) {
      exactMapping.push({ surahNum, surahName, physicalPdfPage: 3, confidence: 'Manual: Page 3' });
      continue;
    }

    const scores = [];
    for (const f of files) {
      const pageNum = parseInt(f.replace(/\D/g, ''), 10);
      const img = await loadImage(path.join(dirPath, f));
      const score = analyzeImage(img);
      scores.push({ pageNum, score });
    }

    // Sort by highest banner score
    scores.sort((a,b) => b.score - a.score);
    const best = scores[0];

    exactMapping.push({
      surahNum,
      surahName,
      physicalPdfPage: best.pageNum,
      score: best.score,
      allScores: scores
    });
  }

  console.log('Audit complete.');
  fs.writeFileSync('surah_physical_audit.json', JSON.stringify(exactMapping, null, 2));

  // Compare with current quranData.ts
  const quranData = await import('./src/data/quranData.ts');
  const surahs = quranData.SURAHS_LIST;
  const quranTextPageToPdfPage = quranData.quranTextPageToPdfPage;

  let diffCount = 0;
  for (let i = 0; i < surahs.length; i++) {
    const s = surahs[i];
    const currentPdfPage = quranTextPageToPdfPage(s.pageStart);
    const audited = exactMapping.find(m => m.surahNum === s.number);
    if (audited && audited.physicalPdfPage !== currentPdfPage) {
      console.log(`MISMATCH: Surah ${s.number} (${s.name}) -> current PDF page ${currentPdfPage} vs audited PDF page ${audited.physicalPdfPage} (Diff: ${audited.physicalPdfPage - currentPdfPage})`);
      diffCount++;
    }
  }

  if (diffCount === 0) {
    console.log('✓ All 114 Surahs match audited candidate pages!');
  } else {
    console.log(`Found ${diffCount} differences!`);
  }
}

auditFolders().catch(console.error);
