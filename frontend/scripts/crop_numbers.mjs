import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const pagesDir = path.resolve(__dirname, '../public/tirmizi/vol1/pages');
  const outDir = path.resolve(__dirname, 'number_crops');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let p = 1; p <= 340; p++) {
    const imgPath = path.join(pagesDir, `page_${p}.webp`);
    if (!fs.existsSync(imgPath)) continue;
    const img = await loadImage(imgPath);
    
    // Number is in header center: x between 44% and 56%, y between 0% and 8%
    const cropX = Math.floor(img.width * 0.44);
    const cropW = Math.floor(img.width * 0.12);
    const cropY = 0;
    const cropH = Math.floor(img.height * 0.08);

    const canvas = createCanvas(cropW, cropH);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    
    fs.writeFileSync(path.join(outDir, `num_${p}.png`), canvas.toBuffer('image/png'));
  }

  console.log('Saved all 340 number crops to scripts/number_crops');
}

main().catch(console.error);
