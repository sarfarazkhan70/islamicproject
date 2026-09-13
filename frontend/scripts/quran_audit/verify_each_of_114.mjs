import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Let's inspect the suspect pages and find the exact page for each of the 114 Surahs:
// Let's create an HTML visual comparison of pages around each Surah:
// For Surah N, show: Page (curr - 1), Page (curr), Page (curr + 1)

async function buildComparisonVerifier() {
  const quranData = await import('./src/data/quranData.ts');
  const surahs = quranData.SURAHS_LIST;
  const pdfData = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data: pdfData }).promise;

  const outDir = path.resolve('surah_triplets');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const renderPage = async (p) => {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        return new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              const canvas = createCanvas(img.width, img.height);
              const ctx = canvas.getContext('2d');
              const imgData = ctx.createImageData(img.width, img.height);
              let srcIdx = 0;
              let dstIdx = 0;
              for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                  imgData.data[dstIdx] = img.data[srcIdx];
                  imgData.data[dstIdx + 1] = img.data[srcIdx + 1];
                  imgData.data[dstIdx + 2] = img.data[srcIdx + 2];
                  imgData.data[dstIdx + 3] = 255;
                  srcIdx += 3;
                  dstIdx += 4;
                }
              }
              ctx.putImageData(imgData, 0, 0);
              resolve(canvas);
            } else {
              resolve(null);
            }
          });
        });
      }
    }
    return null;
  };

  console.log('Rendering banners around all 114 Surahs...');
  // Let's check all 114 Surahs and verify their pages
  let report = [];

  for (let i = 0; i < surahs.length; i++) {
    const s = surahs[i];
    const p = s.pageStart;
    
    // Save image of page p
    const canvas = await renderPage(p);
    if (canvas) {
      const outPath = path.join(outDir, `surah_${String(s.number).padStart(3, '0')}_p${p}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
    }
    report.push({ number: s.number, name: s.name, arabic: s.arabicName, page: p });
  }

  console.log('Finished rendering all 114 Surahs into surah_triplets/');
}

buildComparisonVerifier().catch(console.error);
