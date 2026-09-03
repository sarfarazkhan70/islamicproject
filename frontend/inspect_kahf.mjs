import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function inspectKahf() {
  const p = path.resolve('verification/018-Al-Kahf');
  const files = ['page-541.png', 'page-542.png', 'page-543.png'];
  for (const f of files) {
    const img = await loadImage(path.join(p, f));
    console.log(`Image ${f}: width=${img.width}, height=${img.height}`);
  }
}

inspectKahf().catch(console.error);
