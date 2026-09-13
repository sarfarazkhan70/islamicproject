import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function checkP2Content() {
  const fDir = path.resolve('verification/001-Al-Fatihah');
  const img2 = await loadImage(path.join(fDir, 'page-2.png'));
  const img3 = await loadImage(path.join(fDir, 'page-3.png'));
  const img4 = await loadImage(path.join(fDir, 'page-4.png'));

  // Let's check average color / darkness of page-2 vs page-3 vs page-4
  function getStats(img) {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height);
    let totalDark = 0;
    for (let i = 0; i < data.data.length; i += 4) {
      if (data.data[i] < 80 && data.data[i+1] < 80 && data.data[i+2] < 80) totalDark++;
    }
    return { width: img.width, height: img.height, darkPixels: totalDark };
  }

  console.log('Page 2 stats:', getStats(img2));
  console.log('Page 3 stats:', getStats(img3));
  console.log('Page 4 stats:', getStats(img4));
}

checkP2Content().catch(console.error);
