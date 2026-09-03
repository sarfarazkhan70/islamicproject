import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const vDir = path.resolve('verification');
const dirs = fs.readdirSync(vDir).filter(d => fs.statSync(path.join(vDir, d)).isDirectory()).sort((a,b) => {
  return parseInt(a.split('-')[0], 10) - parseInt(b.split('-')[0], 10);
});

async function findExact114() {
  const final114 = [];

  for (const dir of dirs) {
    const surahNum = parseInt(dir.split('-')[0], 10);
    const surahName = dir.substring(4);

    if (surahNum === 1) {
      final114.push({ surahNum, surahName, physicalPdfPage: 2 });
      continue;
    }
    if (surahNum === 2) {
      final114.push({ surahNum, surahName, physicalPdfPage: 3 });
      continue;
    }

    const p = path.join(vDir, dir);
    const files = fs.readdirSync(p).filter(f => f.endsWith('.png')).sort((a,b) => parseInt(a.replace(/\D/g,''),10) - parseInt(b.replace(/\D/g,''),10));

    let bestFile = files[0];
    let highestDarkness = 0;
    let bestPage = parseInt(files[0].replace(/\D/g,''), 10);

    const candidates = [];

    for (const f of files) {
      const pageNum = parseInt(f.replace(/\D/g,''), 10);
      const img = await loadImage(path.join(p, f));
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const { width, height, data } = ctx.getImageData(0, 0, img.width, img.height);

      const xMin = Math.floor(width * 0.20);
      const xMax = Math.floor(width * 0.80);
      const span = xMax - xMin;

      let maxDarkness = 0;
      let peakY = 0;

      for (let y = 80; y < height - 80; y++) {
        let dark = 0;
        for (let x = xMin; x < xMax; x++) {
          const idx = (y * width + x) * 4;
          const bright = (data[idx] * 299 + data[idx+1] * 587 + data[idx+2] * 114) / 1000;
          if (bright < 125) dark++;
        }
        const ratio = dark / span;
        if (ratio > maxDarkness) {
          maxDarkness = ratio;
          peakY = y;
        }
      }

      candidates.push({ pageNum, maxDarkness, peakY });
    }

    // Sort by maxDarkness descending
    candidates.sort((a,b) => b.maxDarkness - a.maxDarkness);
    const winner = candidates[0];

    final114.push({
      surahNum,
      surahName,
      physicalPdfPage: winner.pageNum,
      confidence: winner.maxDarkness,
      candidates
    });
  }

  console.log('Audited all 114 Surahs!');
  fs.writeFileSync('exact_114_physical_pages.json', JSON.stringify(final114, null, 2));

  // Print all 114
  for (const s of final114) {
    console.log(`Surah ${s.surahNum.toString().padStart(3, ' ')}. ${s.surahName.padEnd(18, ' ')} -> PDF Page ${s.physicalPdfPage}`);
  }
}

findExact114().catch(console.error);
