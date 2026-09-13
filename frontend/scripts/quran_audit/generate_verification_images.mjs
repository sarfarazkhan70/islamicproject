import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function generateVerificationImages() {
  const quranData = await import('./src/data/quranData.ts');
  const surahs = quranData.SURAHS_LIST;
  const pdfPath = path.resolve('public/quran/quran.pdf');

  console.log('Loading PDF...');
  const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data: pdfData }).promise;
  console.log(`PDF loaded: ${doc.numPages} pages.`);

  const outBaseDir = path.resolve('verification');
  if (!fs.existsSync(outBaseDir)) {
    fs.mkdirSync(outBaseDir, { recursive: true });
  }

  // Cache rendered page buffers to avoid re-rendering pages requested by multiple Surahs
  const pageBufferCache = new Map();

  async function getPageBuffer(pageNum) {
    const clamped = Math.max(1, Math.min(doc.numPages, pageNum));
    if (pageBufferCache.has(clamped)) {
      return pageBufferCache.get(clamped);
    }

    const page = await doc.getPage(clamped);
    const ops = await page.getOperatorList();
    
    let buffer = null;
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        buffer = await new Promise((resolve) => {
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
              resolve(canvas.toBuffer('image/png'));
            } else {
              resolve(null);
            }
          });
        });
        break;
      }
    }

    // Fallback if paintImageXObject was not directly intercepted
    if (!buffer) {
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      buffer = canvas.toBuffer('image/png');
    }

    pageBufferCache.set(clamped, buffer);
    return buffer;
  }

  console.log(`Generating verification images for all ${surahs.length} Surahs...`);

  for (let i = 0; i < surahs.length; i++) {
    const s = surahs[i];
    const surahNumStr = String(s.number).padStart(3, '0');
    // Sanitize name for folder (keep clean alphanumeric and hyphens)
    const cleanName = s.name.replace(/[^a-zA-Z0-9-]/g, '');
    const folderName = `${surahNumStr}-${cleanName}`;
    const surahDir = path.join(outBaseDir, folderName);

    if (!fs.existsSync(surahDir)) {
      fs.mkdirSync(surahDir, { recursive: true });
    }

    const candidatePage = s.pageStart;
    const pagesToRender = [];

    if (candidatePage > 1) {
      pagesToRender.push(candidatePage - 1);
    }
    pagesToRender.push(candidatePage);
    if (candidatePage < doc.numPages) {
      pagesToRender.push(candidatePage + 1);
    }

    for (const p of pagesToRender) {
      const imgBuffer = await getPageBuffer(p);
      const targetFile = path.join(surahDir, `page-${p}.png`);
      fs.writeFileSync(targetFile, imgBuffer);
    }

    if ((i + 1) % 20 === 0 || i === surahs.length - 1) {
      console.log(`Processed ${i + 1} / ${surahs.length} Surahs...`);
    }
  }

  // Also create a convenient index.html in the verification directory for easy visual inspection in any browser
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quran Surah Starting Pages Visual Verification</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; margin: 0; }
    h1 { color: #10b981; margin-bottom: 8px; }
    p { color: #94a3b8; margin-top: 0; margin-bottom: 24px; }
    .surah-section { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
    .surah-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 12px; margin-bottom: 16px; }
    .surah-title { font-size: 1.25rem; font-weight: bold; }
    .surah-arabic { font-size: 1.5rem; color: #34d399; font-family: serif; }
    .triplet-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .page-card { background: #0f172a; border-radius: 8px; padding: 10px; border: 1px solid #475569; text-align: center; }
    .page-card.candidate { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.4); }
    .page-label { font-weight: bold; margin-bottom: 8px; font-size: 0.9rem; }
    .page-card.candidate .page-label { color: #34d399; }
    .page-img { width: 100%; height: auto; border-radius: 4px; background: #ffffff; display: block; }
  </style>
</head>
<body>
  <h1>Quran Surah Candidate Pages Visual Inspection</h1>
  <p>Comparing Candidate Page - 1, Candidate Page, and Candidate Page + 1 for all 114 Surahs</p>
`;

  for (const s of surahs) {
    const surahNumStr = String(s.number).padStart(3, '0');
    const cleanName = s.name.replace(/[^a-zA-Z0-9-]/g, '');
    const folderName = `${surahNumStr}-${cleanName}`;
    const candidatePage = s.pageStart;

    const prevP = candidatePage > 1 ? candidatePage - 1 : null;
    const currP = candidatePage;
    const nextP = candidatePage < doc.numPages ? candidatePage + 1 : null;

    html += `
  <div class="surah-section" id="surah-${s.number}">
    <div class="surah-header">
      <div class="surah-title">Surah ${s.number}. ${s.name} (Candidate: Page ${candidatePage})</div>
      <div class="surah-arabic">${s.arabicName}</div>
    </div>
    <div class="triplet-grid">
`;

    if (prevP) {
      html += `
      <div class="page-card">
        <div class="page-label">Page ${prevP} (Candidate - 1)</div>
        <img class="page-img" src="${folderName}/page-${prevP}.png" loading="lazy" alt="Page ${prevP}" />
      </div>`;
    }

    html += `
      <div class="page-card candidate">
        <div class="page-label">★ Page ${currP} (Current Candidate)</div>
        <img class="page-img" src="${folderName}/page-${currP}.png" loading="lazy" alt="Page ${currP}" />
      </div>`;

    if (nextP) {
      html += `
      <div class="page-card">
        <div class="page-label">Page ${nextP} (Candidate + 1)</div>
        <img class="page-img" src="${folderName}/page-${nextP}.png" loading="lazy" alt="Page ${nextP}" />
      </div>`;
    }

    html += `
    </div>
  </div>`;
  }

  html += `
</body>
</html>`;

  fs.writeFileSync(path.join(outBaseDir, 'index.html'), html);
  console.log('Verification images and index.html generated successfully in verification/');
}

generateVerificationImages().catch((err) => {
  console.error('Error generating verification images:', err);
});
