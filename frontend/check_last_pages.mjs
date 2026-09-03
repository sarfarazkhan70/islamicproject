import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Let's create visual crops of each page 1118 to 1124 with horizontal slices
async function checkLastPagesDetail() {
  const dir = path.resolve('juz30_crops');
  for (let p = 1118; p <= 1124; p++) {
    const file = path.join(dir, `page_${p}.png`);
    if (fs.existsSync(file)) {
      const img = await loadImage(file);
      console.log(`Page ${p} dimensions: ${img.width}x${img.height}`);
    } else {
      console.log(`Page ${p} missing in juz30_crops`);
    }
  }
}

checkLastPagesDetail().catch(console.error);
