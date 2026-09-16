import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const pagesDir = path.resolve('public/tirmizi/vol6/pages');
const montageDir = path.resolve('scripts/p6_montages');
fs.mkdirSync(montageDir, { recursive: true });

async function createMontage(startPage, endPage, filename) {
  const count = endPage - startPage + 1;
  const cols = 5;
  const rows = Math.ceil(count / cols);

  const thumbW = 280;
  const thumbH = 400;

  const canvas = createCanvas(cols * thumbW, rows * thumbH);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let p = startPage; p <= endPage; p++) {
    const idx = p - startPage;
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const x = col * thumbW;
    const y = row * thumbH;

    const pageFile = path.join(pagesDir, `page_${p}.webp`);
    if (fs.existsSync(pageFile)) {
      const img = await loadImage(pageFile);
      ctx.drawImage(img, x + 5, y + 25, thumbW - 10, thumbH - 30);
    }

    // Label
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`PDF Page ${p}`, x + 10, y + 20);
  }

  const pngBuf = await canvas.encode('png');
  fs.writeFileSync(path.join(montageDir, filename), pngBuf);
  console.log(`Saved montage ${filename}`);
}

async function run() {
  await createMontage(1, 25, 'montage_1_to_25.png');
  await createMontage(26, 50, 'montage_26_to_50.png');
  await createMontage(51, 75, 'montage_51_to_75.png');
  await createMontage(76, 100, 'montage_76_to_100.png');
  await createMontage(101, 125, 'montage_101_to_125.png');
  await createMontage(126, 157, 'montage_126_to_157.png');
  console.log('All montages created!');
}

run().catch(console.error);
