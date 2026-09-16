import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const pagesDir = path.resolve(__dirname, '../public/tirmizi/vol1/pages');
  const outDir = path.resolve(__dirname, 'front_inspection');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let p = 1; p <= 20; p++) {
    const imgPath = path.join(pagesDir, `page_${p}.webp`);
    if (!fs.existsSync(imgPath)) continue;
    const img = await loadImage(imgPath);
    
    // Top 20%
    const cropH = Math.floor(img.height * 0.20);
    const canvas = createCanvas(img.width, cropH);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, cropH, 0, 0, img.width, cropH);
    
    fs.writeFileSync(path.join(outDir, `front_p${p}.png`), canvas.toBuffer('image/png'));
  }

  console.log('Saved front 20 pages top 20%');
}

main().catch(console.error);
