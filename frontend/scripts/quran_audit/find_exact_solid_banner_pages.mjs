import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const vDir = path.resolve('verification');
const dirs = fs.readdirSync(vDir).filter(d => fs.statSync(path.join(vDir, d)).isDirectory()).sort((a,b) => {
  return parseInt(a.split('-')[0], 10) - parseInt(b.split('-')[0], 10);
});

async function findSolidBanners() {
  const finalMapping = [];

  for (const dir of dirs) {
    const surahNum = parseInt(dir.split('-')[0], 10);
    const surahName = dir.substring(4);

    if (surahNum === 1) {
      finalMapping.push({ surahNum, surahName, physicalPdfPage: 2 });
      continue;
    }
    if (surahNum === 2) {
      finalMapping.push({ surahNum, surahName, physicalPdfPage: 3 });
      continue;
    }

    const p = path.join(vDir, dir);
    const files = fs.readdirSync(p).filter(f => f.endsWith('.png')).sort((a,b) => parseInt(a.replace(/\D/g,''),10) - parseInt(b.replace(/\D/g,''),10));

    const pageStats = [];

    for (const f of files) {
      const pageNum = parseInt(f.replace(/\D/g,''), 10);
      const img = await loadImage(path.join(p, f));
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const { width, height, data } = ctx.getImageData(0, 0, img.width, img.height);

      const xMin = Math.floor(width * 0.25);
      const xMax = Math.floor(width * 0.75);
      const span = xMax - xMin;

      let maxSolidLineRatio = 0;
      let solidLineY = 0;

      for (let y = 100; y < height - 100; y++) {
        let dark = 0;
        for (let x = xMin; x < xMax; x++) {
          const idx = (y * width + x) * 4;
          if (data[idx] < 110 && data[idx+1] < 110 && data[idx+2] < 110) dark++;
        }
        const ratio = dark / span;
        if (ratio > maxSolidLineRatio) {
          maxSolidLineRatio = ratio;
          solidLineY = y;
        }
      }

      pageStats.push({ pageNum, maxSolidLineRatio, solidLineY });
    }

    // Sort by highest maxSolidLineRatio
    pageStats.sort((a,b) => b.maxSolidLineRatio - a.maxSolidLineRatio);
    const winner = pageStats[0];

    finalMapping.push({
      surahNum,
      surahName,
      physicalPdfPage: winner.pageNum,
      winnerRatio: winner.maxSolidLineRatio,
      all: pageStats
    });
  }

  console.log('Finished detecting solid banners for all 114 Surahs.');
  fs.writeFileSync('solid_banners_114.json', JSON.stringify(finalMapping, null, 2));

  for (const s of finalMapping) {
    console.log(`Surah ${s.surahNum.toString().padStart(3, ' ')}. ${s.surahName.padEnd(18, ' ')} -> PDF Page ${s.physicalPdfPage} (Solid Line Ratio: ${(s.winnerRatio*100).toFixed(1)}%)`);
  }
}

findSolidBanners().catch(console.error);
