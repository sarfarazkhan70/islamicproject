import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function inspectLastSurahs() {
  const outDir = path.resolve('last_surahs_crops');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let p of [1118, 1119, 1120, 1121, 1122, 1123, 1124]) {
    const file = path.resolve(`suspect_renders/page_${p}.png`);
    if (!fs.existsSync(file)) continue;
    const img = await loadImage(file);
    
    // Save 9 horizontal slices (each line of the 9-line Mushaf)
    const lineH = Math.floor((img.height - 140) / 9);
    for (let l = 0; l < 9; l++) {
      const startY = 70 + l * lineH;
      const canvas = createCanvas(img.width, lineH);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, startY, img.width, lineH, 0, 0, img.width, lineH);
      fs.writeFileSync(path.join(outDir, `p${p}_line${l+1}.png`), canvas.toBuffer('image/png'));
    }
  }
  console.log('Saved 9-line slices for pages 1118..1124 in last_surahs_crops/');
}

inspectLastSurahs().catch(console.error);
