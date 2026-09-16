import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const pagesDir = path.resolve(__dirname, '../public/tirmizi/vol2/pages');
  const outDir = path.resolve(__dirname, 'p2_full_inspection');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const samplePages = [1, 2, 3, 4, 10, 13, 20, 50, 100, 150, 200, 250, 300, 350, 374, 375];

  for (const p of samplePages) {
    const imgPath = path.join(pagesDir, `page_${p}.webp`);
    if (!fs.existsSync(imgPath)) continue;
    const img = await loadImage(imgPath);
    
    // Bottom 15% (footer)
    const footerH = Math.floor(img.height * 0.15);
    const footerY = img.height - footerH;
    const canvas = createCanvas(img.width, footerH);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, footerY, img.width, footerH, 0, 0, img.width, footerH);
    fs.writeFileSync(path.join(outDir, `footer_p${p}.png`), canvas.toBuffer('image/png'));
  }

  console.log('Saved footer crops of sample pages');
}

main().catch(console.error);
