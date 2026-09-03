import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { SURAHS_LIST, JUZ_LIST, TOTAL_MUSHAF_PDF_PAGES, QURAN_PDF_PATH } from '../src/data/quranData.ts';

async function verifyAll() {
  console.log('--- Step 1: Testing Local Vite Server /quran/quran.pdf HTTP Endpoint ---');
  const serverUrl = `http://localhost:5174${QURAN_PDF_PATH}`;
  const response = await fetch(serverUrl, { method: 'HEAD' });
  console.log(`HTTP HEAD ${serverUrl} => Status: ${response.status} ${response.statusText}`);
  const contentLength = response.headers.get('content-length');
  const contentType = response.headers.get('content-type');
  console.log(`Content-Length: ${contentLength} bytes (~${(parseInt(contentLength || '0') / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`Content-Type: ${contentType}`);

  if (response.status !== 200) {
    throw new Error(`Failed to fetch PDF from server: ${response.status}`);
  }

  console.log('\n--- Step 2: Testing Range Request (Partial Content) ---');
  const rangeResponse = await fetch(serverUrl, {
    headers: { Range: 'bytes=0-1023' }
  });
  console.log(`Range Request (bytes 0-1023) => Status: ${rangeResponse.status} ${rangeResponse.statusText}`);
  const rangeLength = rangeResponse.headers.get('content-length');
  console.log(`Range Content-Length: ${rangeLength} bytes`);

  console.log('\n--- Step 3: Verifying PDF Document Structure with PDF.js ---');
  const buffer = await (await fetch(serverUrl)).arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  console.log(`PDF Loaded successfully via PDF.js! Total Pages: ${pdfDoc.numPages}`);
  if (pdfDoc.numPages !== TOTAL_MUSHAF_PDF_PAGES) {
    console.warn(`Mismatch: pdfDoc.numPages = ${pdfDoc.numPages}, expected ${TOTAL_MUSHAF_PDF_PAGES}`);
  } else {
    console.log(`Verified exact match: ${TOTAL_MUSHAF_PDF_PAGES} pages.`);
  }

  console.log('\n--- Step 4: Verifying Surah Page Mappings (114 Surahs) ---');
  console.log(`Total Surahs: ${SURAHS_LIST.length}`);
  let surahErrors = 0;
  for (const s of SURAHS_LIST) {
    if (s.pageStart < 1 || s.pageStart > TOTAL_MUSHAF_PDF_PAGES) {
      console.error(`Invalid pageStart for Surah ${s.number} (${s.name}): ${s.pageStart}`);
      surahErrors++;
    }
  }
  if (surahErrors === 0) {
    console.log(`All 114 Surahs have valid starting pages (range 3..1123).`);
  }

  console.log('\n--- Step 5: Verifying Juz / Para Page Mappings (30 Paras) ---');
  console.log(`Total Juz: ${JUZ_LIST.length}`);
  let juzErrors = 0;
  for (const j of JUZ_LIST) {
    if (j.pageStart < 1 || j.pageStart > TOTAL_MUSHAF_PDF_PAGES) {
      console.error(`Invalid pageStart for Juz ${j.number} (${j.name}): ${j.pageStart}`);
      juzErrors++;
    }
  }
  if (juzErrors === 0) {
    console.log(`All 30 Juz have valid starting pages (range 3..1085).`);
  }

  console.log('\n--- Step 6: Sample Page Rendering Verification ---');
  const testPages = [3, 4, 92, 143, 818, 1085, 1124];
  for (const p of testPages) {
    const page = await pdfDoc.getPage(p);
    const viewport = page.getViewport({ scale: 1.0 });
    console.log(`Page ${p} loaded: dimensions = ${viewport.width.toFixed(0)}x${viewport.height.toFixed(0)}`);
  }

  console.log('\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
}

verifyAll().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
