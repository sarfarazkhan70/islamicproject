import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function analyze() {
  const dir = path.resolve('suspect_renders');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

  const outDir = path.resolve('suspect_headers');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const f of files) {
    const img = await loadImage(path.join(dir, f));
    // Crop top 120px (page header which has Surah name)
    const canvas = createCanvas(img.width, 120);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, 120, 0, 0, img.width, 120);
    fs.writeFileSync(path.join(outDir, `header_${f}`), canvas.toBuffer('image/png'));
  }
  console.log('Saved all header crops in suspect_headers/');
}

analyze().catch(console.error);
