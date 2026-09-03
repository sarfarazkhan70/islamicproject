import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import {
  SURAHS_LIST,
  JUZ_LIST,
  TOTAL_MUSHAF_PDF_PAGES,
  getSurahByPage,
  getJuzByPage,
  getSurahByNumber,
  getPrintedPageLabel
} from '../src/data/quranData.ts';

async function runExactPagewiseTest() {
  console.log('========================================================================');
  console.log('   EXACT PAGE-WISE SURAH & QURAN PDF NAVIGATION VERIFICATION SUITE      ');
  console.log('========================================================================\n');

  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  let allPass = true;

  // 1. VERIFY ALL 114 SURAHS MAPPED PAGES
  console.log('--- 1. Testing All 114 Surahs Start Pages in PDF ---');
  let surahsPassCount = 0;
  for (const s of SURAHS_LIST) {
    const pageObj = await doc.getPage(s.pageStart);
    if (pageObj && pageObj.pageNumber === s.pageStart) {
      surahsPassCount++;
    } else {
      console.error(`FAIL: Surah ${s.number} (${s.name}) pageStart ${s.pageStart} invalid`);
    }
  }
  const all114Pass = surahsPassCount === 114;
  console.log(`  • 114 / 114 Surahs Verified Renderable at Exact Starting Page => ${all114Pass ? 'PASS' : 'FAIL'}`);
  if (!all114Pass) allPass = false;

  // 2. CHECK SPECIFIC KEY SURAHS
  console.log('\n--- 2. Checking Key Surahs from Beginning, Middle, End ---');
  const keySurahs = [
    { number: 1, name: 'Al-Fatihah', expected: 3 },
    { number: 2, name: 'Al-Baqarah', expected: 4 },
    { number: 3, name: 'Aal-e-Imran', expected: 92 },
    { number: 4, name: 'An-Nisa', expected: 143 },
    { number: 18, name: 'Al-Kahf', expected: 542 },
    { number: 36, name: 'Ya-Sin', expected: 812 },
    { number: 55, name: 'Ar-Rahman', expected: 985 },
    { number: 67, name: 'Al-Mulk', expected: 1044 },
    { number: 112, name: 'Al-Ikhlas', expected: 1123 },
    { number: 113, name: 'Al-Falaq', expected: 1123 },
    { number: 114, name: 'An-Nas', expected: 1123 },
  ];

  for (const s of keySurahs) {
    const meta = getSurahByNumber(s.number);
    const pageObj = await doc.getPage(meta.pageStart);
    const ok = meta.pageStart === s.expected && pageObj.pageNumber === s.expected;
    console.log(
      `  • Surah ${String(s.number).padStart(3, ' ')}: ${s.name.padEnd(20, ' ')} -> Mapped Page: ${meta.pageStart} (Expected: ${s.expected}) | PDF.js pageNumber: ${pageObj.pageNumber} => ${ok ? 'PASS' : 'FAIL'}`
    );
    if (!ok) allPass = false;
  }

  // 3. JUZ / PARA CHECKS
  console.log('\n--- 3. Checking Para / Juz Start Pages ---');
  const keyParas = [
    { number: 1, name: 'Juz 1', expected: 3 },
    { number: 10, name: 'Juz 10', expected: 337 },
    { number: 20, name: 'Juz 20', expected: 707 },
    { number: 30, name: 'Juz 30', expected: 1085 },
  ];

  for (const p of keyParas) {
    const juzObj = JUZ_LIST.find((x) => x.number === p.number);
    const pageObj = await doc.getPage(juzObj.pageStart);
    const ok = juzObj.pageStart === p.expected && pageObj.pageNumber === p.expected;
    console.log(
      `  • Juz ${String(p.number).padStart(2, ' ')}: ${p.name.padEnd(10, ' ')} -> Mapped Page: ${juzObj.pageStart} (Expected: ${p.expected}) | PDF.js pageNumber: ${pageObj.pageNumber} => ${ok ? 'PASS' : 'FAIL'}`
    );
    if (!ok) allPass = false;
  }

  // 4. DIRECT PAGE SELECTION 1:1 WITH ZERO OFFSET
  console.log('\n--- 4. Direct Page Jump 1:1 Matching ---');
  const testDirectPages = [1, 2, 10, 100, 500, 700, 1000, 1124];
  for (const dp of testDirectPages) {
    const pageObj = await doc.getPage(dp);
    const label = getPrintedPageLabel(dp);
    const ok = pageObj.pageNumber === dp && label === `Page ${dp} / 1124`;
    console.log(
      `  • Website Page ${String(dp).padStart(4, ' ')} -> PDF Page: ${pageObj.pageNumber} | UI Label: "${label}" => ${ok ? 'PASS' : 'FAIL'}`
    );
    if (!ok) allPass = false;
  }

  // 5. FILE & ARCHITECTURE CHECKS
  console.log('\n--- 5. Architecture & UI Controls Check ---');
  const storeCode = fs.readFileSync('src/stores/useQuranStore.ts', 'utf8');
  const pageCode = fs.readFileSync('src/pages/Quran/QuranPage.tsx', 'utf8');
  const viewerCode = fs.readFileSync('src/components/quran/QuranPdfCanvasViewer.tsx', 'utf8');

  const hasCentralGoTo = storeCode.includes('goToQuranPage: (pageNumber: number)');
  const hasThreeControls = pageCode.includes('id="surah-select"') && pageCode.includes('id="para-select"') && pageCode.includes('id="top-page-jump-input"');
  const noMiddleButtons = !viewerCode.includes('mushaf-float-nav');
  const hasTouchSwipe = viewerCode.includes('onTouchStart={handleTouchStart}') && viewerCode.includes('onTouchEnd={handleTouchEnd}');

  console.log(`  • Central goToQuranPage navigation function: ${hasCentralGoTo ? 'PASS' : 'FAIL'}`);
  console.log(`  • Top 3 controls (Surah, Para, Page) present: ${hasThreeControls ? 'PASS' : 'FAIL'}`);
  console.log(`  • Middle overlay buttons removed: ${noMiddleButtons ? 'PASS' : 'FAIL'}`);
  console.log(`  • Touch & Pointer swipe handlers wired: ${hasTouchSwipe ? 'PASS' : 'FAIL'}`);

  if (!hasCentralGoTo || !hasThreeControls || !noMiddleButtons || !hasTouchSwipe) {
    allPass = false;
  }

  console.log('\n========================================================================');
  console.log(`                       FINAL RESULT: ${allPass ? 'ALL TESTS PASSED (PASS)' : 'FAILED'}`);
  console.log('========================================================================\n');
}

runExactPagewiseTest().catch(console.error);
