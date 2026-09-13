import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function sliceLastPages() {
  const dir = path.resolve('juz30_crops');
  const outDir = path.resolve('last_pages_slices');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let p = 1114; p <= 1124; p++) {
    const file = path.join(dir, `page_${p}.png`);
    if (!fs.existsSync(file)) continue;
    const img = await loadImage(file);

    // Save 3 slices per page (top, mid, bottom) or 5 slices
    const sliceH = Math.floor(img.height / 4);
    for (let s = 0; s < 4; s++) {
      const canvas = createCanvas(img.width, sliceH);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, s * sliceH, img.width, sliceH, 0, 0, img.width, sliceH);
      fs.writeFileSync(path.join(outDir, `p${p}_slice${s+1}.png`), canvas.toBuffer('image/png'));
    }
  }
  console.log('Saved last pages slices in last_pages_slices/');
}

sliceLastPages().catch(console.error);
