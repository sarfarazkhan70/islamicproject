import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const wasmDir = path.resolve(__dirname, '../public/wasm') + '/';
  const pdfPath = path.resolve(__dirname, '../public/pdf/jami_at_tirmizi_vol1_part1.pdf');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({
    data,
    wasmUrl: wasmDir,
    cMapUrl: path.resolve(__dirname, '../public/cmaps') + '/',
    standardFontDataUrl: path.resolve(__dirname, '../public/standard_fonts') + '/',
  }).promise;

  console.log(`Analyzing ${doc.numPages} pages for printed page numbers...`);

  // Also read scandata.xml
  const xml = fs.readFileSync('scripts/data/tirmizi_v1_p1_scandata.xml', 'utf8');
  const scandataPages = {};
  const pageRegex = /<page\s+leafNum="(\d+)"[^>]*>([\s\S]*?)<\/page>/g;
  let match;
  while ((match = pageRegex.exec(xml)) !== null) {
    const leafNum = parseInt(match[1], 10);
    const content = match[2];
    const pageTypeMatch = content.match(/<pageType>(.*?)<\/pageType>/);
    const pageNumberMatch = content.match(/<pageNumber>(.*?)<\/pageNumber>/);
    scandataPages[leafNum] = {
      pageType: pageTypeMatch ? pageTypeMatch[1] : null,
      pageNumber: pageNumberMatch ? pageNumberMatch[1] : null,
    };
  }

  const results = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items.map(it => it.str).join(' ');
    
    // Check leaf from scandata (0-indexed or 1-indexed)
    const scanDataZero = scandataPages[pageNum - 1];
    const scanDataOne = scandataPages[pageNum];

    results.push({
      pdfPage: pageNum,
      scandataNum: scanDataZero?.pageNumber || null,
      scandataType: scanDataZero?.pageType || null,
      hasText: items.length > 0,
    });
  }

  console.log('--- ALL SCANDATA NUMBERED PAGES ---');
  const numbered = results.filter(r => r.scandataNum);
  console.log(`Found ${numbered.length} scandata numbered pages.`);
  numbered.slice(0, 30).forEach(r => console.log(`PDF ${r.pdfPage} -> Printed ${r.scandataNum} (${r.scandataType})`));
  numbered.slice(-30).forEach(r => console.log(`PDF ${r.pdfPage} -> Printed ${r.scandataNum} (${r.scandataType})`));
}

main().catch(console.error);
