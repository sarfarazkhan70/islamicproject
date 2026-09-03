import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const samples = [
  { dir: '001-Al-Fatihah', name: 'Al-Fatihah' },
  { dir: '002-Al-Baqarah', name: 'Al-Baqarah' },
  { dir: '003-AliImran', name: 'AliImran' },
  { dir: '004-An-Nisa', name: 'An-Nisa' },
  { dir: '005-Al-Maidah', name: 'Al-Maidah' },
  { dir: '018-Al-Kahf', name: 'Al-Kahf' },
  { dir: '036-Ya-Sin', name: 'Ya-Sin' },
  { dir: '067-Al-Mulk', name: 'Al-Mulk' },
  { dir: '114-An-Nas', name: 'An-Nas' }
];

async function inspectSamples() {
  for (const s of samples) {
    console.log(`\n=== Checking Surah: ${s.name} (${s.dir}) ===`);
    const p = path.resolve('verification', s.dir);
    const files = fs.readdirSync(p).filter(f => f.endsWith('.png')).sort((a,b) => parseInt(a.replace(/\D/g,''),10) - parseInt(b.replace(/\D/g,''),10));

    for (const f of files) {
      const imgPath = path.join(p, f);
      const img = await loadImage(imgPath);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const { width, height, data } = ctx.getImageData(0, 0, img.width, img.height);

      // Check row-by-row darkness in the inner 70% width
      const xMin = Math.floor(width * 0.20);
      const xMax = Math.floor(width * 0.80);
      const span = xMax - xMin;

      let maxDarkRow = 0;
      let maxDarkY = 0;
      let denseBandRows = 0;

      for (let y = 80; y < height - 80; y++) {
        let dark = 0;
        for (let x = xMin; x < xMax; x++) {
          const idx = (y * width + x) * 4;
          // Grayscale brightness
          const bright = (data[idx] * 299 + data[idx+1] * 587 + data[idx+2] * 114) / 1000;
          if (bright < 130) dark++;
        }
        const ratio = dark / span;
        if (ratio > maxDarkRow) {
          maxDarkRow = ratio;
          maxDarkY = y;
        }
        if (ratio > 0.35) denseBandRows++;
      }

      console.log(`  File: ${f} -> Max Row Darkness: ${(maxDarkRow * 100).toFixed(1)}% at y=${maxDarkY} | Dense Band Rows: ${denseBandRows}`);
    }
  }
}

inspectSamples().catch(console.error);
