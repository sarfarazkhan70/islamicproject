import http from 'http';
import fs from 'fs';
import path from 'path';
import { loadImage } from '@napi-rs/canvas';

async function testHttp(vol) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5173/sharah-muslim/jild-${vol}/page_1.webp`, (res) => {
      resolve({ vol, status: res.statusCode, contentType: res.headers['content-type'], length: res.headers['content-length'] });
    }).on('error', (err) => {
      resolve({ vol, error: err.message });
    });
  });
}

async function main() {
  console.log('--- Testing HTTP Image Responses ---');
  for (let v = 1; v <= 7; v++) {
    const res = await testHttp(v);
    console.log(`Vol ${v}:`, res);
  }

  console.log('\n--- Testing Local Image Dimensions ---');
  for (let v = 1; v <= 7; v++) {
    const p = path.resolve(`./public/sharah-muslim/jild-${v}/page_1.webp`);
    if (fs.existsSync(p)) {
      const stats = fs.statSync(p);
      const img = await loadImage(p);
      console.log(`Vol ${v}: Size=${stats.size} bytes, Dimensions=${img.width}x${img.height}`);
    } else {
      console.log(`Vol ${v}: NOT FOUND at ${p}`);
    }
  }
}

main().catch(console.error);
