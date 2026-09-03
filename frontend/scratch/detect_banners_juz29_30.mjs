import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

async function scanBanners() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const results = [];

  for (let p = 1044; p <= 1124; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              const darkRows = [];
              for (let y = 60; y < img.height - 60; y += 2) {
                let darkCount = 0;
                for (let x = 180; x < 620; x += 2) {
                  const idx = (y * img.width + x) * 3;
                  const r = img.data[idx];
                  const g = img.data[idx + 1];
                  const b = img.data[idx + 2];
                  if (r < 75 && g < 75 && b < 75) darkCount++;
                }
                if (darkCount > 180) {
                  darkRows.push(y);
                }
              }
              if (darkRows.length > 10) {
                results.push({ page: p, rowCount: darkRows.length, minY: darkRows[0], maxY: darkRows[darkRows.length - 1] });
              }
            }
            resolve();
          });
        });
        break;
      }
    }
  }

  console.log('Detected banner pages in 1044..1124:');
  console.log(JSON.stringify(results, null, 2));
}

scanBanners().catch(console.error);
