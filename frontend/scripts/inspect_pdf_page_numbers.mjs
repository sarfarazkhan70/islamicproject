import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectUrduPdf() {
  const pdfPath = path.resolve(__dirname, '../public/pdf/hadaiq_e_bakhshish.pdf');
  console.log('Loading Urdu PDF from:', pdfPath);
  const loadingTask = pdfjsLib.getDocument({ url: pdfPath });
  const doc = await loadingTask.promise;
  console.log('Total PDF Pages (Urdu):', doc.numPages);

  // Check text content of first 30 pages and some middle/end pages
  const samplePages = [1, 2, 3, 10, 11, 12, 13, 14, 15, 16, 20, 21, 22, 50, 78, 100, 159, 279, 302, 444, 450, 454];
  for (const pageNum of samplePages) {
    if (pageNum > doc.numPages) continue;
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const strings = textContent.items.map(item => item.str).filter(s => s.trim().length > 0);
    console.log(`\n--- Urdu PDF Page ${pageNum} ---`);
    console.log('First 5 items:', strings.slice(0, 8).join(' | '));
    console.log('Last 5 items:', strings.slice(-5).join(' | '));
  }
}

async function inspectHindiPdf() {
  const pdfPath = path.resolve(__dirname, '../public/pdf/hadaiq_e_bakhshish_hindi.pdf');
  console.log('\n==================================\nLoading Hindi PDF from:', pdfPath);
  const loadingTask = pdfjsLib.getDocument({ url: pdfPath });
  const doc = await loadingTask.promise;
  console.log('Total PDF Pages (Hindi):', doc.numPages);

  const samplePages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 50, 100, 200, 300, 400, 498];
  for (const pageNum of samplePages) {
    if (pageNum > doc.numPages) continue;
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const strings = textContent.items.map(item => item.str).filter(s => s.trim().length > 0);
    console.log(`\n--- Hindi PDF Page ${pageNum} ---`);
    console.log('Text items count:', strings.length);
    console.log('First items:', strings.slice(0, 8).join(' | '));
    console.log('Last items:', strings.slice(-5).join(' | '));
  }
}

async function run() {
  try {
    await inspectUrduPdf();
    await inspectHindiPdf();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
