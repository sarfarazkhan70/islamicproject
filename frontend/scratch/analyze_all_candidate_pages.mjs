import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from '@napi-rs/canvas';

// We want to determine for each Surah 1..114 its exact starting page
// In every candidate page, the top-left or top-right has the Surah number in Urdu numerals,
// and the main body has the ornamental banner if a new Surah starts on that page!

// Let's create a script that lists where each banner appears by checking the saved images in scratch/surah_header_crops/
async function analyzeAllPages() {
  const files = fs.readdirSync('scratch/surah_header_crops')
    .filter(f => f.startsWith('page_') && f.endsWith('.png'))
    .sort();

  console.log(`Analyzing ${files.length} candidate page images...`);

  // Banners have a distinct dark border rectangle with height between 45 and 115 px across x=200..600
  const surahStarts = [];

  for (const f of files) {
    const pageNum = parseInt(f.replace('page_', '').replace('.png', ''), 10);
    const img = await loadImage(path.join('scratch/surah_header_crops', f));
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, img.width, img.height);

    // Check for Surah banner box (dark borders)
    const barRows = [];
    for (let y = 60; y < img.height - 60; y++) {
      let darkCount = 0;
      for (let x = 200; x < 600; x++) {
        const idx = (y * img.width + x) * 4;
        const r = imgData.data[idx];
        const g = imgData.data[idx + 1];
        const b = imgData.data[idx + 2];
        if (r < 75 && g < 75 && b < 75) darkCount++;
      }
      if (darkCount > 340) {
        barRows.push(y);
      }
    }

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

    let hasBanner = false;
    for (let a = 0; a < lines.length; a++) {
      for (let b = a + 1; b < lines.length; b++) {
        const h = lines[b] - lines[a];
        if (h >= 45 && h <= 110) {
          hasBanner = true;
          break;
        }
      }
      if (hasBanner) break;
    }

    if (pageNum === 3 || pageNum === 4 || hasBanner) {
      surahStarts.push(pageNum);
    }
  }

  console.log('Detected Surah start pages in candidate files:');
  console.log(JSON.stringify(Array.from(new Set(surahStarts))));
}

analyzeAllPages().catch(console.error);
