import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function createHeaderMontage(pages, outPath, title) {
  const images = [];
  for (const p of pages) {
    const imgPath = `./public/sharah-muslim/jild-7/page_${p}.webp`;
    if (fs.existsSync(imgPath)) {
      const img = await loadImage(imgPath);
      images.push({ page: p, img });
    }
  }

  if (images.length === 0) return;

  const headerH = 120;
  const labelW = 180;
  const canvasW = images[0].img.width + labelW;
  const canvasH = images.length * (headerH + 20) + 60;

  const canvas = createCanvas(canvasW, canvasH);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(title, 20, 35);

  let y = 60;
  for (const { page, img } of images) {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(10, y - 5, canvasW - 20, headerH + 10);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`PDF Scan: ${page}`, 20, y + headerH / 2);

    ctx.drawImage(img, 0, 0, img.width, Math.round(img.height * 0.10), labelW, y, img.width, headerH);
    y += headerH + 20;
  }

  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buf);
  console.log(`Saved montage: ${outPath}`);
}

async function main() {
  await createHeaderMontage([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], './scripts/jild7_front_1_15.png', 'Jild 7: Scans 1..15');
}

main().catch(console.error);
