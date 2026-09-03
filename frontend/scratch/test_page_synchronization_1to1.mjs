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

async function testPageSync1To1() {
  console.log('========================================================================');
  console.log('       1:1 PDF PAGE SYNCHRONIZATION & ZERO OFFSET VERIFICATION          ');
  console.log('========================================================================\n');

  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  let allPassed = true;

  // 1. DIRECT PAGE TESTS: Website Page X = PDF page X
  console.log('--- 1. Direct Page 1:1 Mapping Verification ---');
  const directPages = [1, 2, 10, 100, 500, 1000, 1124];
  for (const p of directPages) {
    const pageObj = await doc.getPage(p);
    const label = getPrintedPageLabel(p);
    const pageNumberMatches = pageObj.pageNumber === p;
    const labelMatches = label === `Page ${p} / 1124`;
    const ok = pageNumberMatches && labelMatches;

    console.log(
      `  • Website Page ${String(p).padStart(4, ' ')} -> PDF.js getPage(${p}): pageNumber = ${pageObj.pageNumber} | Label: "${label}" => ${ok ? 'PASS' : 'FAIL'}`
    );
    if (!ok) allPassed = false;
  }

  // 2. CENTRAL NAVIGATION FUNCTION (goToQuranPage) SIMULATION
  console.log('\n--- 2. Central Navigation Clamping & Store State ---');
  const simulateGoToQuranPage = (pageNumber) => {
    const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, Math.floor(pageNumber) || 1));
    const meta = getSurahByPage(clamped);
    const juz = getJuzByPage(clamped);
    return {
      mushafPage: clamped,
      currentSurahNumber: meta.number,
      selectedPara: juz.number,
      label: getPrintedPageLabel(clamped)
    };
  };

  const nav500 = simulateGoToQuranPage(500);
  console.log(`  • goToQuranPage(500)  -> mushafPage: ${nav500.mushafPage}, Label: "${nav500.label}" => ${nav500.mushafPage === 500 ? 'PASS' : 'FAIL'}`);
  const nav0 = simulateGoToQuranPage(0);
  console.log(`  • goToQuranPage(0)    -> Clamped to: ${nav0.mushafPage} (Expected 1) => ${nav0.mushafPage === 1 ? 'PASS' : 'FAIL'}`);
  const navOver = simulateGoToQuranPage(1500);
  console.log(`  • goToQuranPage(1500) -> Clamped to: ${navOver.mushafPage} (Expected 1124) => ${navOver.mushafPage === 1124 ? 'PASS' : 'FAIL'}`);

  if (nav500.mushafPage !== 500 || nav0.mushafPage !== 1 || navOver.mushafPage !== 1124) {
    allPassed = false;
  }

  // 3. SURAH MAPPINGS 1:1 TO PDF PAGES
  console.log('\n--- 3. Surah Starting Pages (1:1 1-based PDF Pages) ---');
  const sampleSurahs = [
    { number: 1, name: 'Al-Fatihah', expectedPage: 3 },
    { number: 2, name: 'Al-Baqarah', expectedPage: 4 },
    { number: 3, name: 'Aal-e-Imran', expectedPage: 92 },
    { number: 4, name: 'An-Nisa', expectedPage: 143 },
    { number: 18, name: 'Al-Kahf', expectedPage: 542 },
    { number: 36, name: 'Ya-Sin', expectedPage: 812 },
    { number: 55, name: 'Ar-Rahman', expectedPage: 985 },
    { number: 67, name: 'Al-Mulk', expectedPage: 1044 },
    { number: 112, name: 'Al-Ikhlas', expectedPage: 1123 },
    { number: 113, name: 'Al-Falaq', expectedPage: 1123 },
    { number: 114, name: 'An-Nas', expectedPage: 1123 },
  ];

  for (const s of sampleSurahs) {
    const meta = getSurahByNumber(s.number);
    const pageObj = await doc.getPage(meta.pageStart);
    const ok = meta.pageStart === s.expectedPage && pageObj.pageNumber === s.expectedPage;
    console.log(
      `  • Surah ${String(s.number).padStart(3, ' ')}: ${s.name.padEnd(20, ' ')} -> Mapped Page: ${meta.pageStart} | PDF Page: ${pageObj.pageNumber} => ${ok ? 'PASS' : 'FAIL'}`
    );
    if (!ok) allPassed = false;
  }

  // 4. JUZ / PARA MAPPINGS
  console.log('\n--- 4. Juz Starting Pages (1:1 1-based PDF Pages) ---');
  const testJuzs = [
    { number: 1, name: 'Juz 1', expectedPage: 3 },
    { number: 10, name: 'Juz 10', expectedPage: 337 },
    { number: 20, name: 'Juz 20', expectedPage: 707 },
    { number: 30, name: 'Juz 30', expectedPage: 1085 },
  ];

  for (const j of testJuzs) {
    const juzObj = JUZ_LIST.find((x) => x.number === j.number);
    const pageObj = await doc.getPage(juzObj.pageStart);
    const ok = juzObj.pageStart === j.expectedPage && pageObj.pageNumber === j.expectedPage;
    console.log(
      `  • Juz ${String(j.number).padStart(2, ' ')}: ${j.name.padEnd(10, ' ')} -> Mapped Page: ${juzObj.pageStart} | PDF Page: ${pageObj.pageNumber} => ${ok ? 'PASS' : 'FAIL'}`
    );
    if (!ok) allPassed = false;
  }

  // 5. ALL 114 SURAHS CONSISTENCY CHECK
  console.log('\n--- 5. All 114 Surahs Strictly Monotonic & Within [1..1124] ---');
  let monotonic = true;
  let prevPage = 1;
  for (const s of SURAHS_LIST) {
    if (s.pageStart < prevPage || s.pageStart > TOTAL_MUSHAF_PDF_PAGES) {
      console.error(`  ERROR: Surah ${s.number} (${s.name}) pageStart ${s.pageStart} is invalid (prev: ${prevPage})`);
      monotonic = false;
    }
    prevPage = s.pageStart;
  }
  console.log(`  • 114 Surahs monotonicity & boundary check: ${monotonic ? 'PASS' : 'FAIL'}`);
  if (!monotonic) allPassed = false;

  console.log('\n========================================================================');
  console.log(`               OVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED (PASS)' : 'FAILED'}`);
  console.log('========================================================================\n');
}

testPageSync1To1().catch(console.error);
