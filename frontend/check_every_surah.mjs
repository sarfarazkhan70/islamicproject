import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function checkEverySurah() {
  const vDir = path.resolve('verification');
  const folders = fs.readdirSync(vDir).filter(f => fs.statSync(path.join(vDir, f)).isDirectory()).sort();

  console.log(`Auditing all ${folders.length} Surahs...`);
}

checkEverySurah().catch(console.error);
