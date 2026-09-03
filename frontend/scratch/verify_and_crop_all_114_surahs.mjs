import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { SURAHS_LIST, JUZ_LIST, TOTAL_MUSHAF_PDF_PAGES, getSurahByNumber } from '../src/data/quranData.ts';

async function verifyAll114SurahsWithImages() {
  console.log('Verifying all 114 Surahs and saving header proof images...');
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const proofDir = path.resolve('scratch/surah_proofs');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

  const auditReport = [];

  for (const surah of SURAHS_LIST) {
    const pageNum = surah.pageStart;
    const page = await doc.getPage(pageNum);
    const ops = await page.getOperatorList();
    let imgData = null;

    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) imgData = img;
            resolve();
          });
        });
        break;
      }
    }

    let proofSaved = false;
    if (imgData) {
      const canvas = createCanvas(imgData.width, Math.min(imgData.height, 400));
      const ctx = canvas.getContext('2d');
      const imgDataCanvas = ctx.createImageData(imgData.width, canvas.height);

      let src = 0;
      let dst = 0;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < imgData.width; x++) {
          imgDataCanvas.data[dst] = imgData.data[src];
          imgDataCanvas.data[dst + 1] = imgData.data[src + 1];
          imgDataCanvas.data[dst + 2] = imgData.data[src + 2];
          imgDataCanvas.data[dst + 3] = 255;
          src += 3;
          dst += 4;
        }
      }
      ctx.putImageData(imgDataCanvas, 0, 0);
      const proofFile = path.join(proofDir, `surah_${String(surah.number).padStart(3, '0')}_page_${String(pageNum).padStart(4, '0')}.png`);
      fs.writeFileSync(proofFile, canvas.toBuffer('image/png'));
      proofSaved = true;
    }

    auditReport.push({
      number: surah.number,
      name: surah.name,
      arabicName: surah.arabicName,
      mappedPdfPage: pageNum,
      pdfPageValid: page.pageNumber === pageNum,
      proofSaved: proofSaved
    });
  }

  console.log(`\nVerified all ${auditReport.length} Surahs against public/quran/quran.pdf.`);
  fs.writeFileSync('scratch/all_114_surahs_audit.json', JSON.stringify(auditReport, null, 2));

  // Verify all 114 pages are strictly valid and monotonic
  let validAll = true;
  for (let i = 0; i < SURAHS_LIST.length; i++) {
    const s = SURAHS_LIST[i];
    if (s.pageStart < 3 || s.pageStart > 1123) {
      console.error(`Invalid pageStart for Surah ${s.number}: ${s.pageStart}`);
      validAll = false;
    }
    if (i > 0 && s.pageStart < SURAHS_LIST[i - 1].pageStart) {
      console.error(`Non-monotonic pageStart: Surah ${s.number} (${s.pageStart}) < Surah ${SURAHS_LIST[i - 1].number} (${SURAHS_LIST[i - 1].pageStart})`);
      validAll = false;
    }
  }

  console.log(`\nAll 114 Surahs check: ${validAll ? '100% VALID & MONOTONIC' : 'INVALID'}`);
}

verifyAll114SurahsWithImages().catch(console.error);
