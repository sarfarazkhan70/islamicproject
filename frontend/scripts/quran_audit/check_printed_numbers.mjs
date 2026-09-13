import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function checkPrintedNumbers() {
  const fDir = path.resolve('verification/001-Al-Fatihah');
  const bDir = path.resolve('verification/002-Al-Baqarah');
  
  // Let's inspect page-2, page-3, page-4, page-5
  // Where are page numbers printed in Subcontinent Mushafs? Usually top-outer corners or bottom-center!
  // Top left: x: 50..200, y: 30..90
  // Top right: x: 600..750, y: 30..90
  // Bottom center: x: 300..500, y: 1000..1080
  const outDir = path.resolve('printed_number_crops');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const p of [2, 3, 4, 5]) {
    let file = path.join(fDir, `page-${p}.png`);
    if (!fs.existsSync(file)) file = path.join(bDir, `page-${p}.png`);
    if (!fs.existsSync(file)) continue;

    const img = await loadImage(file);
    
    // Top banner
    const topCanvas = createCanvas(img.width, 100);
    const topCtx = topCanvas.getContext('2d');
    topCtx.drawImage(img, 0, 0, img.width, 100, 0, 0, img.width, 100);
    fs.writeFileSync(path.join(outDir, `p${p}_top.png`), topCanvas.toBuffer('image/png'));

    // Bottom banner
    const botCanvas = createCanvas(img.width, 100);
    const botCtx = botCanvas.getContext('2d');
    botCtx.drawImage(img, 0, img.height - 100, img.width, 100, 0, 0, img.width, 100);
    fs.writeFileSync(path.join(outDir, `p${p}_bot.png`), botCanvas.toBuffer('image/png'));

    console.log(`Cropped top and bottom for page ${p}`);
  }
}

checkPrintedNumbers().catch(console.error);
