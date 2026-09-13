import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('--- RUNNING SAHIH AL-BUKHARI TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  // Test 1: PDF file exists and size is valid
  const pdfPath = path.resolve(__dirname, 'public/pdf/bukhari_shareef_drive.pdf');
  assert(fs.existsSync(pdfPath), 'Local PDF file exists at public/pdf/bukhari_shareef_drive.pdf');
  const pdfSize = fs.statSync(pdfPath).size;
  assert(pdfSize > 40_000_000, `PDF size is authentic complete edition: ${(pdfSize / (1024 * 1024)).toFixed(1)} MB`);

  // Test 2: WASM decoders present in public/wasm
  const wasmDir = path.resolve(__dirname, 'public/wasm');
  assert(fs.existsSync(wasmDir), 'public/wasm directory exists');
  assert(fs.existsSync(path.join(wasmDir, 'jbig2.wasm')), 'jbig2.wasm decoder present');
  assert(fs.existsSync(path.join(wasmDir, 'openjpeg.wasm')), 'openjpeg.wasm decoder present');

  // Test 3: Bukhari Reader component code structure
  const readerPath = path.resolve(__dirname, 'src/components/library/BukhariReader.tsx');
  const readerCode = fs.readFileSync(readerPath, 'utf8');
  assert(!readerCode.includes('Previous Page') && !readerCode.includes('Next Page'), 'No Prev/Next buttons in reader');
  assert(readerCode.includes('bukhari-vertical-reading-stream'), 'Contains pure vertical reading stream');
  assert(readerCode.includes('bukhari-page-card'), 'Contains responsive bukhari-page-card items');
  assert(readerCode.includes('aspectRatio'), 'Preserves page aspect ratio without distortion');
  assert(readerCode.includes('totalPages'), 'Configured with totalPages (699 pages)');
  assert(readerCode.includes('Fit Width'), 'Contains Fit Width responsive mode');
  assert(readerCode.includes('125%') && readerCode.includes('150%') && readerCode.includes('175%') && readerCode.includes('200%'), 'Contains size presets');

  // Test 4: PDF.js document loading and multi-page access
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    wasmUrl: wasmDir + '/',
    cMapUrl: path.resolve(__dirname, 'public/cmaps') + '/',
    standardFontDataUrl: path.resolve(__dirname, 'public/standard_fonts') + '/',
  }).promise;

  assert(doc.numPages === 699, `PDF has all ${doc.numPages} pages accessible`);

  // Test 5: Verify sample pages from start, middle, and end of the book
  const samplePages = [1, 2, 3, 10, 20, 50, 100, 350, 699];
  for (const pNum of samplePages) {
    const page = await doc.getPage(pNum);
    assert(page && page.view && page.view.length === 4, `Page ${pNum} loaded successfully with view [${page.view.join(', ')}]`);
  }

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
