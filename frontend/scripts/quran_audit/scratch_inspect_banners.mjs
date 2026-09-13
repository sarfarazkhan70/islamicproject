import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function inspectBannerImages() {
  const dir = path.resolve('scratch_sample_checks');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, ''), 10);
    const numB = parseInt(b.replace(/[^0-9]/g, ''), 10);
    return numA - numB;
  });

  const outCrops = path.resolve('scratch_detected_banner_crops');
  if (!fs.existsSync(outCrops)) fs.mkdirSync(outCrops, { recursive: true });

  for (const f of files) {
    const img = await loadImage(path.join(dir, f));
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, img.width, img.height);

    let rowDensity = [];
    for (let y = 80; y < img.height - 80; y++) {
      let dark = 0;
      for (let x = 160; x < 630; x++) {
        const idx = (y * img.width + x) * 4;
        if (imgData.data[idx] < 60 && imgData.data[idx+1] < 60 && imgData.data[idx+2] < 60) {
          dark++;
        }
      }
      rowDensity.push({ y, dark });
    }

    const solidLines = rowDensity.filter(r => r.dark > 380).map(r => r.y);
    let foundBanners = [];
    for (let a = 0; a < solidLines.length; a++) {
      for (let b = a + 1; b < solidLines.length; b++) {
        const diff = solidLines[b] - solidLines[a];
        if (diff >= 45 && diff <= 110) {
          if (!foundBanners.some(fb => Math.abs(fb - solidLines[a]) < 30)) {
            foundBanners.push(solidLines[a]);
            // Crop this banner
            const cropC = createCanvas(img.width, diff + 30);
            const cropCtx = cropC.getContext('2d');
            cropCtx.drawImage(canvas, 0, Math.max(0, solidLines[a] - 10), img.width, diff + 30, 0, 0, img.width, diff + 30);
            fs.writeFileSync(path.join(outCrops, `${f.replace('.png', '')}_banner_y${solidLines[a]}.png`), cropC.toBuffer('image/png'));
          }
        }
      }
    }

    console.log(`${f.padEnd(15, ' ')}: Banners at Y = ${foundBanners.length > 0 ? foundBanners.join(', ') : 'None'}`);
  }
}

inspectBannerImages().catch(console.error);
