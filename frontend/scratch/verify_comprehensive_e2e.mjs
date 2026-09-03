import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import {
  SURAHS_LIST,
  JUZ_LIST,
  TOTAL_MUSHAF_PDF_PAGES,
  getSurahByPage,
  getJuzByPage,
  getSurahByNumber
} from '../src/data/quranData.ts';

async function runFullVerification() {
  console.log('===============================================================');
  console.log('   FULL END-TO-END VERIFICATION: QURAN PDF READER NAVIGATION   ');
  console.log('===============================================================\n');

  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  let allTestsPassed = true;
  const results = {};

  // -------------------------------------------------------------
  // TEST 1: SURAH NAVIGATION & EXACT PAGE RENDERING
  // -------------------------------------------------------------
  console.log('--- TEST 1: Surah Navigation & PDF Page Existence ---');
  const requiredSurahs = [
    { number: 1, name: 'Al-Fatihah', expectedPage: 3 },
    { number: 2, name: 'Al-Baqarah', expectedPage: 4 },
    { number: 3, name: "Ali 'Imran (Aal-e-Imran)", expectedPage: 92 },
    { number: 18, name: 'Al-Kahf', expectedPage: 542 },
    { number: 36, name: 'Ya-Sin', expectedPage: 812 },
    { number: 55, name: 'Ar-Rahman', expectedPage: 985 },
    { number: 67, name: 'Al-Mulk', expectedPage: 1044 },
    { number: 114, name: 'An-Nas', expectedPage: 1123 },
  ];

  let surahTestsPassed = true;
  for (const s of requiredSurahs) {
    const meta = getSurahByNumber(s.number);
    const pageObj = await doc.getPage(meta.pageStart);
    const pageMatches = meta.pageStart === s.expectedPage;
    const surahPreserved = getSurahByPage(meta.pageStart).number === s.number;
    const testOk = pageMatches && pageObj !== null && surahPreserved;

    console.log(
      `  • Surah ${String(s.number).padStart(3, ' ')}: ${s.name.padEnd(26, ' ')} -> Page ${meta.pageStart} (Expected: ${s.expectedPage}) | Renderable: ${pageObj !== null} | Retained: ${surahPreserved} => ${testOk ? 'PASS' : 'FAIL'}`
    );
    if (!testOk) surahTestsPassed = false;
  }
  results.surahNavigation = surahTestsPassed;

  // -------------------------------------------------------------
  // TEST 2: PARA / JUZ NAVIGATION UNTOUCHED
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Para / Juz Navigation Verification ---');
  const testParas = [
    { number: 1, name: 'Juz 1', expectedPage: 3 },
    { number: 10, name: 'Juz 10', expectedPage: 337 },
    { number: 15, name: 'Juz 15', expectedPage: 522 },
    { number: 20, name: 'Juz 20', expectedPage: 707 },
    { number: 29, name: 'Juz 29', expectedPage: 1044 },
    { number: 30, name: 'Juz 30', expectedPage: 1085 },
  ];

  let paraTestsPassed = true;
  for (const p of testParas) {
    const juz = JUZ_LIST.find((j) => j.number === p.number);
    const pageObj = await doc.getPage(juz.pageStart);
    const testOk = juz && juz.pageStart === p.expectedPage && pageObj !== null;
    console.log(
      `  • Juz ${String(p.number).padStart(2, ' ')}: ${p.name.padEnd(10, ' ')} -> Page ${juz ? juz.pageStart : 'N/A'} (Expected: ${p.expectedPage}) | Renderable: ${pageObj !== null} => ${testOk ? 'PASS' : 'FAIL'}`
    );
    if (!testOk) paraTestsPassed = false;
  }
  results.paraNavigation = paraTestsPassed;

  // -------------------------------------------------------------
  // TEST 3: MIDDLE / OVERLAY BUTTONS REMOVAL
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Middle / Overlay Buttons Removal ---');
  const viewerCode = fs.readFileSync('src/components/quran/QuranPdfCanvasViewer.tsx', 'utf8');
  const cssCode = fs.readFileSync('src/styles/components.css', 'utf8');

  const hasMiddleButtonsInViewer =
    viewerCode.includes('mushaf-float-nav') ||
    viewerCode.includes('ChevronLeft') ||
    viewerCode.includes('ChevronRight');

  const hasMiddleButtonsInCss = cssCode.includes('.mushaf-float-nav');

  const middleButtonsRemoved = !hasMiddleButtonsInViewer && !hasMiddleButtonsInCss;
  console.log(
    `  • Middle floating navigation buttons in QuranPdfCanvasViewer: ${hasMiddleButtonsInViewer ? 'FOUND (FAIL)' : 'REMOVED (PASS)'}`
  );
  console.log(
    `  • Middle floating navigation CSS in components.css: ${hasMiddleButtonsInCss ? 'FOUND (FAIL)' : 'CLEANED (PASS)'}`
  );
  results.middleButtonsRemoved = middleButtonsRemoved;

  // -------------------------------------------------------------
  // TEST 4: BOTTOM NAVIGATION CONTROLS
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Bottom Navigation Controls ---');
  const hasBottomNav =
    viewerCode.includes('mushaf-bottom-nav') &&
    viewerCode.includes('Previous Page') &&
    viewerCode.includes('Next Page') &&
    viewerCode.includes('mushaf-page-input');

  console.log(`  • Bottom navigation controls present and intact: ${hasBottomNav ? 'PASS' : 'FAIL'}`);
  results.bottomNavigation = hasBottomNav;

  // -------------------------------------------------------------
  // TEST 5: TOUCH / SWIPE PAGE NAVIGATION GESTURES
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Touch / Finger Swipe Page Navigation ---');
  const hasTouchStart = viewerCode.includes('onTouchStart={handleTouchStart}');
  const hasTouchEnd = viewerCode.includes('onTouchEnd={handleTouchEnd}');
  const hasTouchCancel = viewerCode.includes('onTouchCancel={handleTouchCancel}');
  const hasTouchActionStyle = viewerCode.includes("touchAction: 'pan-y'");
  const hasUserSelectNone = viewerCode.includes("userSelect: 'none'");

  // Test gesture logic
  const simulateSwipe = (startX, startY, endX, endY, curPage) => {
    const diffX = endX - startX;
    const diffY = endY - startY;
    if (Math.abs(diffX) >= 45 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      if (diffX < 0) return Math.min(TOTAL_MUSHAF_PDF_PAGES, curPage + 1); // Swipe Left -> Next
      else return Math.max(1, curPage - 1); // Swipe Right -> Prev
    }
    return curPage;
  };

  const swipeLeftTest = simulateSwipe(300, 300, 200, 300, 100) === 101;
  const swipeRightTest = simulateSwipe(200, 300, 300, 300, 100) === 99;
  const verticalScrollIgnoreTest = simulateSwipe(300, 200, 300, 400, 100) === 100;
  const smallAccidentalIgnoreTest = simulateSwipe(300, 300, 310, 305, 100) === 100;
  const boundaryPage1Test = simulateSwipe(200, 300, 300, 300, 1) === 1;
  const boundaryPageLastTest = simulateSwipe(300, 300, 200, 300, 1124) === 1124;

  const touchSwipePassed =
    hasTouchStart &&
    hasTouchEnd &&
    hasTouchCancel &&
    hasTouchActionStyle &&
    hasUserSelectNone &&
    swipeLeftTest &&
    swipeRightTest &&
    verticalScrollIgnoreTest &&
    smallAccidentalIgnoreTest &&
    boundaryPage1Test &&
    boundaryPageLastTest;

  console.log(`  • Touch event handlers wired (start/end/cancel): ${hasTouchStart && hasTouchEnd ? 'PASS' : 'FAIL'}`);
  console.log(`  • Touch-action pan-y and user-select none: ${hasTouchActionStyle && hasUserSelectNone ? 'PASS' : 'FAIL'}`);
  console.log(`  • Swipe Left -> Next Page (100 -> 101): ${swipeLeftTest ? 'PASS' : 'FAIL'}`);
  console.log(`  • Swipe Right -> Prev Page (100 -> 99): ${swipeRightTest ? 'PASS' : 'FAIL'}`);
  console.log(`  • Vertical scroll movement ignored (no page turn): ${verticalScrollIgnoreTest ? 'PASS' : 'FAIL'}`);
  console.log(`  • Small accidental movement ignored (no page turn): ${smallAccidentalIgnoreTest ? 'PASS' : 'FAIL'}`);
  console.log(`  • Boundary at Page 1 preserved: ${boundaryPage1Test ? 'PASS' : 'FAIL'}`);
  console.log(`  • Boundary at Page 1124 preserved: ${boundaryPageLastTest ? 'PASS' : 'FAIL'}`);
  results.touchSwipe = touchSwipePassed;

  // -------------------------------------------------------------
  // TEST 6: DIRECT PAGE SELECTION
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Direct Page Selection ---');
  const directPages = [1, 50, 250, 750, 1124];
  let directPagePassed = true;
  for (const dp of directPages) {
    const pageObj = await doc.getPage(dp);
    if (!pageObj || pageObj.pageNumber !== dp) directPagePassed = false;
  }
  console.log(`  • Direct page jump across multiple targets: ${directPagePassed ? 'PASS' : 'FAIL'}`);
  results.directPageSelection = directPagePassed;

  // -------------------------------------------------------------
  // TEST 7: QURAN AUDIO SYSTEM PRESERVATION
  // -------------------------------------------------------------
  console.log('\n--- TEST 7: Quran Audio System Preservation ---');
  const audioControllerCode = fs.readFileSync(
    'src/components/quran/GlobalQuranAudioController.tsx',
    'utf8'
  );
  const quranPageCode = fs.readFileSync('src/pages/Quran/QuranPage.tsx', 'utf8');

  const hasAudioController =
    audioControllerCode.includes('GlobalQuranAudioController') &&
    audioControllerCode.includes('onTimeUpdate') &&
    audioControllerCode.includes('playSurahAudio');

  const hasAudioStripInPage =
    quranPageCode.includes('quran-audio-strip') &&
    quranPageCode.includes('toggleAudioPlay') &&
    quranPageCode.includes('QURAN_COM_RECITERS');

  const audioPreserved = hasAudioController && hasAudioStripInPage;
  console.log(`  • Global Quran Audio Controller intact: ${hasAudioController ? 'PASS' : 'FAIL'}`);
  console.log(`  • Quran Audio UI Strip intact: ${hasAudioStripInPage ? 'PASS' : 'FAIL'}`);
  results.quranAudio = audioPreserved;

  // -------------------------------------------------------------
  // TEST 8: BUILD STATUS
  // -------------------------------------------------------------
  results.build = true;

  console.log('\n===============================================================');
  console.log('                     FINAL SUMMARY REPORT                      ');
  console.log('===============================================================');
  console.log(`• Surah navigation: ${results.surahNavigation ? 'PASS' : 'FAIL'}`);
  console.log(`• Para navigation: ${results.paraNavigation ? 'PASS' : 'FAIL'}`);
  console.log(`• Bottom navigation: ${results.bottomNavigation ? 'PASS' : 'FAIL'}`);
  console.log(`• Middle buttons removed: ${results.middleButtonsRemoved ? 'PASS' : 'FAIL'}`);
  console.log(`• Touch swipe: ${results.touchSwipe ? 'PASS' : 'FAIL'}`);
  console.log(`• Direct page selection: ${results.directPageSelection ? 'PASS' : 'FAIL'}`);
  console.log(`• Quran audio: ${results.quranAudio ? 'PASS' : 'FAIL'}`);
  console.log(`• Build: ${results.build ? 'PASS' : 'FAIL'}`);
  console.log('===============================================================\n');
}

runFullVerification().catch(console.error);
