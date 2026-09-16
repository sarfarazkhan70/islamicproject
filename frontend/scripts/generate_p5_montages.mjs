import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const cropsDir = path.resolve(__dirname, 'p5_crops');
  const montagesDir = path.resolve(__dirname, 'p5_montages');
  if (!fs.existsSync(montagesDir)) fs.mkdirSync(montagesDir, { recursive: true });

  const totalPages = 371;
  const chunkSize = 25;

  for (let start = 1; start <= totalPages; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, totalPages);
    const count = end - start + 1;

    // Load images
    const images = [];
    for (let p = start; p <= end; p++) {
      const pFile = path.join(cropsDir, `num_${p}.png`);
      if (fs.existsSync(pFile)) {
        const img = await loadImage(pFile);
        images.push({ p, img });
      }
    }

    if (images.length === 0) continue;

    const cols = 5;
    const rows = Math.ceil(images.length / cols);
    const cellW = 240;
    const cellH = 140;

    const montageCanvas = createCanvas(cols * cellW, rows * cellH);
    const ctx = montageCanvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, montageCanvas.width, montageCanvas.height);

    for (let i = 0; i < images.length; i++) {
      const { p, img } = images[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * cellW;
      const y = row * cellH;

      ctx.fillStyle = '#334155';
      ctx.fillRect(x + 4, y + 4, cellW - 8, cellH - 8);

      // Draw crop
      ctx.drawImage(img, x + 8, y + 28, cellW - 16, cellH - 36);

      // Draw label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`PDF Page ${p}`, x + 12, y + 20);
    }

    const outFile = path.join(montagesDir, `montage_${start}_to_${end}.png`);
    fs.writeFileSync(outFile, montageCanvas.toBuffer('image/png'));
    console.log(`Saved montage for pages ${start} to ${end}`);
  }
}

main().catch(console.error);
