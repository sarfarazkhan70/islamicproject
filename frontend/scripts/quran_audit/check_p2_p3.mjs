import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function checkP2andP3() {
  const fDir = path.resolve('verification/001-Al-Fatihah');
  const img2 = await loadImage(path.join(fDir, 'page-2.png'));
  const img3 = await loadImage(path.join(fDir, 'page-3.png'));
  const img4 = await loadImage(path.join(fDir, 'page-4.png'));

  console.log(`Page 2: ${img2.width}x${img2.height}`);
  console.log(`Page 3: ${img3.width}x${img3.height}`);
  console.log(`Page 4: ${img4.width}x${img4.height}`);
}

checkP2andP3().catch(console.error);
