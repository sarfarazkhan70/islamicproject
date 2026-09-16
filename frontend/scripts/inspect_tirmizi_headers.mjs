import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const pagesDir = path.resolve(__dirname, '../public/tirmizi/vol1/pages');
  const outDir = path.resolve(__dirname, 'header_samples');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const samplePages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50, 75, 80, 81, 82, 85, 100, 126, 127, 130, 150, 200, 209, 210, 215, 250, 251, 252, 300, 321, 322, 335, 338, 339, 340];

  for (const p of samplePages) {
    const imgPath = path.join(pagesDir, `page_${p}.webp`);
    if (!fs.existsSync(imgPath)) continue;
    const img = await loadImage(imgPath);
    
    // Crop top 12% (where header with page number is located)
    const headerH = Math.floor(img.height * 0.12);
    const canvas = createCanvas(img.width, headerH);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, headerH, 0, 0, img.width, headerH);
    
    fs.writeFileSync(path.join(outDir, `header_page_${p}.png`), canvas.toBuffer('image/png'));
  }

  console.log('Cropped header samples saved to scripts/header_samples');
}

main().catch(console.error);
