import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function analyzeAllPages() {
  const filePath = path.resolve('public/pdf/sahih_muslim_vol1.pdf');
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({
    data,
    standardFontDataUrl: 'public/standard_fonts/',
    cMapUrl: 'public/cmaps/',
    cMapPacked: true,
  }).promise;
  
  console.log('Total PDF pages in file:', doc.numPages);

  const results = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const ops = await page.getOperatorList();
    
    // Check for paintImageXObject (pdfjsLib.OPS.paintImageXObject is 85)
    // or paintJpegXObject, etc.
    let imageCount = 0;
    let imageNames = [];
    for (let j = 0; j < ops.fnArray.length; j++) {
      const fn = ops.fnArray[j];
      if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintInlineImageXObject || fn === pdfjsLib.OPS.paintJpegXObject || fn === pdfjsLib.OPS.paintImageMaskXObject) {
        imageCount++;
        imageNames.push(ops.argsArray[j]?.[0] || 'inline');
      }
    }

    const textContent = await page.getTextContent();
    const text = textContent.items.map((it) => it.str).join(' ').trim();
    
    results.push({
      pageNum: i,
      opsCount: ops.fnArray.length,
      imageCount,
      imageNames,
      textLength: text.length,
      textPreview: text.slice(0, 40),
    });
  }

  // Summarize pages with 0 images or few ops
  const noImagePages = results.filter(r => r.imageCount === 0);
  console.log(`Pages with NO images: ${noImagePages.length}`, noImagePages.map(r => r.pageNum));

  const zeroOpsPages = results.filter(r => r.opsCount === 0);
  console.log(`Pages with 0 ops: ${zeroOpsPages.length}`, zeroOpsPages.map(r => r.pageNum));

  // Check first 15 and last 15 pages in detail
  console.log('--- FIRST 15 PAGES ---');
  results.slice(0, 15).forEach(r => console.log(JSON.stringify(r)));

  console.log('--- LAST 15 PAGES ---');
  results.slice(-15).forEach(r => console.log(JSON.stringify(r)));

  // Write full summary to a json file in scratch
  fs.writeFileSync('scripts/pdf_page_analysis.json', JSON.stringify(results, null, 2));
  console.log('Saved analysis to scripts/pdf_page_analysis.json');
}

analyzeAllPages().catch(console.error);
