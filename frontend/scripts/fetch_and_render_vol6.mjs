import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const totalPages = 157;
const outDir = path.resolve('public/tirmizi/vol6/pages');
const coverPath = path.resolve('public/tirmizi/vol6/cover.webp');
const montageDir = path.resolve('scripts/p6_montages');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(montageDir, { recursive: true });

function getImageUrl(index) {
  const padIndex = String(index).padStart(4, '0');
  return `https://ia601406.us.archive.org/BookReader/BookReaderImages.php?zip=/25/items/JamiaTirmiziVolume01Part01/Jamia_Tirmizi_Volume_02_-_Part_03_jp2.zip&file=Jamia_Tirmizi_Volume_02_-_Part_03_jp2/Jamia_Tirmizi_Volume_02_-_Part_03_${padIndex}.jp2&id=JamiaTirmiziVolume01Part01&scale=2&rotate=0`;
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 200) {
        return Buffer.from(await res.arrayBuffer());
      }
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

async function processPage(pageNum) {
  const index = pageNum - 1;
  const url = getImageUrl(index);
  const outPath = path.join(outDir, `page_${pageNum}.webp`);

  const jpgBuf = await fetchWithRetry(url);
  const img = await loadImage(jpgBuf);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const webpBuf = await canvas.encode('webp', 85);
  fs.writeFileSync(outPath, webpBuf);

  if (pageNum === 1) {
    fs.writeFileSync(coverPath, webpBuf);
  }

  console.log(`Saved page ${pageNum}/${totalPages} (${webpBuf.byteLength} bytes)`);
}

async function main() {
  console.log(`Starting download & conversion of ${totalPages} pages for Tirmizi Vol 6...`);

  const concurrency = 6;
  const queue = Array.from({ length: totalPages }, (_, i) => i + 1);

  async function worker() {
    while (queue.length > 0) {
      const pageNum = queue.shift();
      try {
        await processPage(pageNum);
      } catch (err) {
        console.error(`Error on page ${pageNum}:`, err);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  console.log('All 157 pages downloaded and converted to WebP successfully!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
