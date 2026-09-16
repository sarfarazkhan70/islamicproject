import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function main() {
  const xml = fs.readFileSync('scripts/data/tirmizi_v1_p1_scandata.xml', 'utf8');
  const pageRegex = /<page\s+leafNum="(\d+)"[^>]*>([\s\S]*?)<\/page>/g;
  let match;
  const pages = [];
  while ((match = pageRegex.exec(xml)) !== null) {
    const leafNum = parseInt(match[1], 10);
    const content = match[2];
    const pageTypeMatch = content.match(/<pageType>(.*?)<\/pageType>/);
    const pageNumberMatch = content.match(/<pageNumber>(.*?)<\/pageNumber>/);
    const rotateMatch = content.match(/<rotateDegree>(.*?)<\/rotateDegree>/);
    const subTitleMatch = content.match(/<pageSubTitle>(.*?)<\/pageSubTitle>/);
    pages.push({
      leafNum,
      pageType: pageTypeMatch ? pageTypeMatch[1] : null,
      pageNumber: pageNumberMatch ? pageNumberMatch[1] : null,
      rotateDegree: rotateMatch ? rotateMatch[1] : null,
      pageSubTitle: subTitleMatch ? subTitleMatch[1] : null,
    });
  }

  console.log('Total pages in scandata:', pages.length);
  console.log('--- FIRST 20 PAGES ---');
  pages.slice(0, 20).forEach(p => console.log(JSON.stringify(p)));
  console.log('--- LAST 20 PAGES ---');
  pages.slice(-20).forEach(p => console.log(JSON.stringify(p)));

  const rotated = pages.filter(p => p.rotateDegree && p.rotateDegree !== '0');
  console.log('Rotated pages count:', rotated.length);
  if (rotated.length > 0) {
    console.log('Rotated pages:', rotated);
  }

  // Load PDF with pdfjsLib to check PDF page count & rotations & text on each page
  const pdfBuffer = fs.readFileSync('public/pdf/jami_at_tirmizi_vol1_part1.pdf');
  const uint8 = new Uint8Array(pdfBuffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8 });
  const pdfDoc = await loadingTask.promise;
  console.log('--- PDF DOCUMENT INFO ---');
  console.log('PDF Total Pages:', pdfDoc.numPages);

  // Sample page text and headers from first 15 pages and last 15 pages
  for (let i = 1; i <= Math.min(15, pdfDoc.numPages); i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(it => it.str).join(' ').trim();
    console.log(`PDF Page ${i} (Rotate: ${page.rotate}): text length=${text.length}, preview="${text.slice(0, 100)}"`);
  }

  console.log('--- CHECKING PAGES 16 to 30 ---');
  for (let i = 16; i <= Math.min(30, pdfDoc.numPages); i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(it => it.str).join(' ').trim();
    console.log(`PDF Page ${i} (Rotate: ${page.rotate}): text length=${text.length}, preview="${text.slice(0, 100)}"`);
  }
}

main().catch(console.error);
