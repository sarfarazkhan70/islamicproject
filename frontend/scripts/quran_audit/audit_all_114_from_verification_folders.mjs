import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function auditAll114Folders() {
  const vDir = path.resolve('verification');
  const folders = fs.readdirSync(vDir).filter(f => fs.statSync(path.join(vDir, f)).isDirectory()).sort();

  const results = [];

  for (const folder of folders) {
    const folderPath = path.join(vDir, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.png')).sort((a,b) => {
      const pA = parseInt(a.replace(/[^0-9]/g, ''), 10);
      const pB = parseInt(b.replace(/[^0-9]/g, ''), 10);
      return pA - pB;
    });

    const surahNum = parseInt(folder.split('-')[0], 10);
    const surahName = folder.substring(4);

    let pageBanners = [];

    for (const f of files) {
      const pageNum = parseInt(f.replace(/[^0-9]/g, ''), 10);
      const img = await loadImage(path.join(folderPath, f));
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height);

      // Measure solid horizontal banner lines
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
      let banners = [];
      for (let a = 0; a < solidLines.length; a++) {
        for (let b = a + 1; b < solidLines.length; b++) {
          const diff = solidLines[b] - solidLines[a];
          if (diff >= 45 && diff <= 110) {
            if (!banners.some(bn => Math.abs(bn - solidLines[a]) < 30)) {
              banners.push(solidLines[a]);
            }
          }
        }
      }

      if (banners.length > 0) {
        pageBanners.push({ page: pageNum, banners });
      }
    }

    results.push({
      surahNum,
      surahName,
      folder,
      files: files.map(f => parseInt(f.replace(/[^0-9]/g, ''), 10)),
      pageBanners
    });
  }

  console.log('Processed all 114 Surahs from verification images.');
  fs.writeFileSync('surah_audit_triplet_results.json', JSON.stringify(results, null, 2));

  for (const r of results) {
    const candidate = r.files[1] || r.files[0];
    const detected = r.pageBanners.map(pb => `p${pb.page}(${pb.banners.length})`).join(', ');
    console.log(`Surah ${String(r.surahNum).padStart(3, ' ')}. ${r.surahName.padEnd(20, ' ')} | Candidate: ${String(candidate).padStart(4, ' ')} | Detected Banners: ${detected || 'None in triplet'}`);
  }
}

auditAll114Folders().catch(console.error);
