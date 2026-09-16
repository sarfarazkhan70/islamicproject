import fs from 'fs';
import path from 'path';
import { loadImage } from '@napi-rs/canvas';

async function main() {
  const masterCoverSrc = path.resolve('./public/sharah-muslim/jild-1/page_1.webp');
  const masterCoverBuf = fs.readFileSync(masterCoverSrc);

  console.log(`Master cover loaded: ${masterCoverBuf.length} bytes`);

  // 1. Process Jild 3
  const jild3Dir = path.resolve('./public/sharah-muslim/jild-3');
  const jild3Page1 = path.join(jild3Dir, 'page_1.webp');
  const jild3InnerTitle = path.join(jild3Dir, 'page_1_inner_title.webp');
  const jild3Cover = path.join(jild3Dir, 'cover.webp');

  if (fs.existsSync(jild3Page1) && !fs.existsSync(jild3InnerTitle)) {
    fs.copyFileSync(jild3Page1, jild3InnerTitle);
    console.log('✓ Backed up Jild 3 original scan 1 to page_1_inner_title.webp');
  }
  fs.writeFileSync(jild3Page1, masterCoverBuf);
  fs.writeFileSync(jild3Cover, masterCoverBuf);
  console.log('✓ Updated Jild 3 page_1.webp and cover.webp with authentic master cover');

  // 2. Process Jild 6
  const jild6Dir = path.resolve('./public/sharah-muslim/jild-6');
  const jild6Page1 = path.join(jild6Dir, 'page_1.webp');
  const jild6InnerTitle = path.join(jild6Dir, 'page_1_inner_title.webp');
  const jild6Cover = path.join(jild6Dir, 'cover.webp');

  if (fs.existsSync(jild6Page1) && !fs.existsSync(jild6InnerTitle)) {
    fs.copyFileSync(jild6Page1, jild6InnerTitle);
    console.log('✓ Backed up Jild 6 original scan 1 to page_1_inner_title.webp');
  }
  fs.writeFileSync(jild6Page1, masterCoverBuf);
  fs.writeFileSync(jild6Cover, masterCoverBuf);
  console.log('✓ Updated Jild 6 page_1.webp and cover.webp with authentic master cover');

  // 3. Ensure cover.webp in all volumes
  for (let v = 1; v <= 7; v++) {
    const vDir = path.resolve(`./public/sharah-muslim/jild-${v}`);
    const vCover = path.join(vDir, 'cover.webp');
    const vPage1 = path.join(vDir, 'page_1.webp');
    if (!fs.existsSync(vCover) && fs.existsSync(vPage1)) {
      fs.copyFileSync(vPage1, vCover);
    }
  }

  // 4. Verify all 7 covers
  console.log('\n--- Verification of All 7 Volume Covers ---');
  for (let v = 1; v <= 7; v++) {
    const p1 = path.resolve(`./public/sharah-muslim/jild-${v}/page_1.webp`);
    const s1 = fs.statSync(p1);
    const img1 = await loadImage(p1);
    console.log(`Jild ${v}: Size=${s1.size} bytes, Dimensions=${img1.width}x${img1.height} px`);
  }
}

main().catch(console.error);
