import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

// Let's analyze all 1124 pages to find:
// 1. All Para cover pages (green background: predominantly green RGB where G > R + 20 and G > B + 20)
// 2. All Surah title banners
// 3. Exact start page of every Para (1..30)
// 4. Exact start page of every Surah (1..114)

async function buildFullIndex() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  console.log(`Document loaded: ${doc.numPages} pages.`);

  const pageReports = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              // Check if page is green cover
              let greenPixels = 0;
              let sampleCount = 0;
              const step = 20; // sample every 20 pixels
              for (let y = 100; y < img.height - 100; y += step) {
                for (let x = 100; x < img.width - 100; x += step) {
                  const idx = (y * img.width + x) * 3;
                  const r = img.data[idx];
                  const g = img.data[idx + 1];
                  const b = img.data[idx + 2];
                  sampleCount++;
                  if (g > 60 && g > r * 1.3 && g > b * 1.3) {
                    greenPixels++;
                  }
                }
              }
              const greenRatio = greenPixels / sampleCount;
              const isGreenCover = greenRatio > 0.4;

              // Check for Surah banner in middle rows
              // In this Mushaf, a Surah banner has a distinctive dark dense frame with "سورة"
              // Let's record if it's green cover or normal page
              pageReports.push({
                pdfPage: p,
                isGreenCover,
                greenRatio: +greenRatio.toFixed(3),
                width: img.width,
                height: img.height
              });
            }
            resolve();
          });
        });
        break;
      }
    }
  }

  const greenPages = pageReports.filter(r => r.isGreenCover).map(r => r.pdfPage);
  console.log(`Found ${greenPages.length} green cover pages:`, greenPages);

  fs.writeFileSync('page_reports.json', JSON.stringify({ greenPages, pageReports }, null, 2));
}

buildFullIndex().catch(console.error);
