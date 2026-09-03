const PARA_COVER_PDF_PAGES = [
  1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
  373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
  743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
];

const TOTAL_QURAN_TEXT_PAGES = 1094;

function quranTextPageToPdfPage(textPage) {
  const clamped = Math.max(1, Math.min(TOTAL_QURAN_TEXT_PAGES, textPage));
  let pdfPage = clamped;
  for (const coverPdfPage of PARA_COVER_PDF_PAGES) {
    if (pdfPage >= coverPdfPage) {
      pdfPage++;
    } else {
      break;
    }
  }
  return pdfPage;
}

function pdfPageToQuranTextPage(pdfPage) {
  const clamped = Math.max(1, Math.min(1124, pdfPage));
  const precedingCovers = PARA_COVER_PDF_PAGES.filter(c => c <= clamped).length;
  return Math.max(1, Math.min(TOTAL_QURAN_TEXT_PAGES, clamped - precedingCovers));
}

// Test round-trip for all 1094 pages
let errors = 0;
for (let p = 1; p <= 1094; p++) {
  const pdfP = quranTextPageToPdfPage(p);
  const backP = pdfPageToQuranTextPage(pdfP);
  if (p !== backP) {
    console.error(`Mismatch for text page ${p}: pdf=${pdfP}, back=${backP}`);
    errors++;
  }
  // Also verify that pdfP is NEVER a cover page!
  if (PARA_COVER_PDF_PAGES.includes(pdfP)) {
    console.error(`ERROR: text page ${p} maps to cover page ${pdfP}`);
    errors++;
  }
}

console.log(`Round-trip verification of all 1094 text pages: ${errors === 0 ? 'PERFECT 100% MATCH' : errors + ' errors'}`);

// Print key tests
console.log('Page 1 -> PDF page:', quranTextPageToPdfPage(1));
console.log('Page 2 -> PDF page:', quranTextPageToPdfPage(2));
console.log('Page 75 -> PDF page:', quranTextPageToPdfPage(75));
console.log('Page 76 -> PDF page:', quranTextPageToPdfPage(76));
console.log('Page 78 -> PDF page:', quranTextPageToPdfPage(78));
console.log('Page 528 (Al-Kahf) -> PDF page:', quranTextPageToPdfPage(528));
console.log('Page 790 (Ya-Sin) -> PDF page:', quranTextPageToPdfPage(790));
console.log('Page 1015 (Al-Mulk) -> PDF page:', quranTextPageToPdfPage(1015));
console.log('Page 1055 (An-Naba) -> PDF page:', quranTextPageToPdfPage(1055));
console.log('Page 1093 (An-Nas) -> PDF page:', quranTextPageToPdfPage(1093));
console.log('Page 1094 (Dua Khatam) -> PDF page:', quranTextPageToPdfPage(1094));
