import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const cropsDir = path.resolve(__dirname, 'number_crops');
  const outDir = path.resolve(__dirname, 'montages');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const batchSize = 25; // 5x5 grid
  const totalPages = 340;

  for (let start = 1; start <= totalPages; start += batchSize) {
    const end = Math.min(start + batchSize - 1, totalPages);
    const cols = 5;
    const rows = Math.ceil((end - start + 1) / cols);

    const cellW = 160;
    const cellH = 100;

    const canvas = createCanvas(cols * cellW, rows * cellH);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let p = start; p <= end; p++) {
      const idx = p - start;
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = col * cellW;
      const y = row * cellH;

      const imgPath = path.join(cropsDir, `num_${p}.png`);
      if (fs.existsSync(imgPath)) {
        const img = await loadImage(imgPath);
        ctx.drawImage(img, x, y + 25, cellW, cellH - 30);
      }

      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`PDF ${p}`, x + 10, y + 20);

      ctx.strokeStyle = '#cccccc';
      ctx.strokeRect(x, y, cellW, cellH);
    }

    const montagePath = path.join(outDir, `montage_${start}_to_${end}.png`);
    fs.writeFileSync(montagePath, canvas.toBuffer('image/png'));
  }

  console.log('Saved all montages to scripts/montages');
}

main().catch(console.error);
