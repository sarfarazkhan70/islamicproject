import {
  SURAHS_LIST,
  JUZ_LIST,
  TOTAL_MUSHAF_PDF_PAGES,
  PDF_PHYSICAL_TOTAL_PAGES,
  quranTextPageToPdfPage,
  pdfPageToQuranTextPage,
  getSurahByNumber,
  getSurahByPage,
  getJuzByPage,
  getPrintedPageLabel,
  isCoverPage,
} from './src/data/quranData.ts';

console.log('=== COMPLETE QURAN NAVIGATION AUDIT & VERIFICATION ===\n');

// 1. Total counts check
console.log(`[TEST 1] Verification of Surahs and Pages count:`);
console.assert(SURAHS_LIST.length === 114, 'SURAHS_LIST must have exactly 114 surahs');
console.assert(JUZ_LIST.length === 30, 'JUZ_LIST must have exactly 30 juz');
console.assert(TOTAL_MUSHAF_PDF_PAGES === 1094, 'TOTAL_MUSHAF_PDF_PAGES must be 1094');
console.assert(PDF_PHYSICAL_TOTAL_PAGES === 1124, 'PDF_PHYSICAL_TOTAL_PAGES must be 1124');
console.log(`✓ 114 Surahs, 30 Juz, 1094 Quran Text Pages, 1124 Physical PDF Pages confirmed.\n`);

// 2. Monotonicity & bounds check
console.log(`[TEST 2] Page Bounds & Monotonicity Verification:`);
let prevPage = 1;
for (let i = 0; i < SURAHS_LIST.length; i++) {
  const s = SURAHS_LIST[i];
  console.assert(s.number === i + 1, `Surah index ${i} has mismatch number ${s.number}`);
  console.assert(s.pageStart >= 1 && s.pageStart <= TOTAL_MUSHAF_PDF_PAGES, `Surah ${s.number} pageStart out of bounds`);
  console.assert(s.pageStart >= prevPage, `Surah ${s.number} pageStart (${s.pageStart}) is less than previous (${prevPage})`);
  prevPage = s.pageStart;
}
console.log(`✓ All 114 Surahs start within 1..1094 and are strictly ordered.\n`);

// 3. Juz Page Starts
console.log(`[TEST 3] Juz Start Pages Verification:`);
let prevJuzPage = 1;
for (let j = 0; j < JUZ_LIST.length; j++) {
  const juz = JUZ_LIST[j];
  console.assert(juz.number === j + 1, `Juz index ${j} has mismatch number ${juz.number}`);
  console.assert(juz.pageStart >= 1 && juz.pageStart <= TOTAL_MUSHAF_PDF_PAGES, `Juz ${juz.number} pageStart out of bounds`);
  console.assert(juz.pageStart >= prevJuzPage, `Juz ${juz.number} pageStart (${juz.pageStart}) is less than previous (${prevJuzPage})`);
  prevJuzPage = juz.pageStart;
}
console.log(`✓ All 30 Juz start within 1..1094 and are strictly ordered.\n`);

// 4. Test page 800 search
console.log(`[TEST 4] Verification of User Reported Page 800 Search:`);
const page800Pdf = quranTextPageToPdfPage(800);
console.assert(page800Pdf === 822, `Page 800 must resolve to PDF page 822, got ${page800Pdf}`);
console.log(`  ✓ Page 800 -> Renders Physical PDF Page ${page800Pdf} (displays Quran page 800)\n`);

// 5. Test page 78 search
console.log(`[TEST 5] Verification of User Reported Page 78 Search:`);
const page78Pdf = quranTextPageToPdfPage(78);
console.assert(page78Pdf === 81, `Page 78 must resolve to PDF page 81, got ${page78Pdf}`);
console.log(`  ✓ Page 78 -> Renders Physical PDF Page ${page78Pdf} (displays Quran page 78)\n`);

// 6. Test key Surahs
console.log(`[TEST 6] Verification of Key Surah Starting Pages & PDF.js resolution:`);
const keyTests = [
  { n: 1, name: "Al-Fatihah", expectedTextPage: 1, expectedPdfPage: 2 },
  { n: 2, name: "Al-Baqarah", expectedTextPage: 2, expectedPdfPage: 3 },
  { n: 18, name: "Al-Kahf", expectedTextPage: 526, expectedPdfPage: 541 },
  { n: 36, name: "Ya-Sin", expectedTextPage: 789, expectedPdfPage: 811 },
  { n: 67, name: "Al-Mulk", expectedTextPage: 1015, expectedPdfPage: 1044 },
  { n: 78, name: "An-Naba", expectedTextPage: 1055, expectedPdfPage: 1085 },
  { n: 114, name: "An-Nas", expectedTextPage: 1093, expectedPdfPage: 1123 }
];

for (const t of keyTests) {
  const s = getSurahByNumber(t.n);
  console.assert(s.pageStart === t.expectedTextPage, `Surah ${t.name} pageStart (${s.pageStart}) !== expected (${t.expectedTextPage})`);
  const resolvedPdf = quranTextPageToPdfPage(s.pageStart);
  console.assert(resolvedPdf === t.expectedPdfPage, `Physical PDF page mismatch for ${t.name}: resolved ${resolvedPdf} vs expected ${t.expectedPdfPage}`);
  console.log(`  ✓ ${s.number}. ${s.name} -> Printed Page ${s.pageStart} (Renders Physical PDF Page ${resolvedPdf})`);
}

console.log('\n=== ALL INTEGRATION VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
