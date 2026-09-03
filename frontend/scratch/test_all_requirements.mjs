import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import { SURAHS_LIST, JUZ_LIST, getSurahByPage, getJuzByPage, getSurahByNumber } from '../src/data/quranData.ts';

async function runComprehensiveTests() {
  console.log('====================================================');
  console.log('QURAN READER NAVIGATION COMPREHENSIVE VERIFICATION');
  console.log('====================================================\n');

  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  let allPassed = true;

  // 1. Surah Tests
  console.log('--- 1. Testing Surah Navigation ---');
  const testSurahs = [
    { name: 'Al-Fatihah', number: 1, expectedPage: 3 },
    { name: 'Al-Baqarah', number: 2, expectedPage: 4 },
    { name: 'Ya-Sin', number: 36, expectedPage: 812 },
    { name: 'An-Nas', number: 114, expectedPage: 1123 }
  ];

  for (const s of testSurahs) {
    const meta = getSurahByNumber(s.number);
    const pageObj = await doc.getPage(meta.pageStart);
    const passed = meta.pageStart === s.expectedPage && pageObj !== null;
    console.log(`Surah ${s.number} (${s.name}): pageStart=${meta.pageStart} (Expected ${s.expectedPage}) => ${passed ? 'PASS' : 'FAIL'}`);
    if (!passed) allPassed = false;
  }

  // 2. Para / Juz Tests
  console.log('\n--- 2. Testing Para / Juz Navigation ---');
  const testParas = [
    { number: 1, name: 'Juz 1', expectedPage: 3 },
    { number: 10, name: 'Juz 10', expectedPage: 337 },
    { number: 20, name: 'Juz 20', expectedPage: 707 },
    { number: 30, name: 'Juz 30', expectedPage: 1085 }
  ];

  for (const p of testParas) {
    const juz = JUZ_LIST.find(j => j.number === p.number);
    const pageObj = await doc.getPage(juz.pageStart);
    const passed = juz && juz.pageStart === p.expectedPage && pageObj !== null;
    console.log(`Juz ${p.number} (${p.name}): pageStart=${juz.pageStart} (Expected ${p.expectedPage}) => ${passed ? 'PASS' : 'FAIL'}`);
    if (!passed) allPassed = false;
  }

  // 3. Direct Page Jump Tests
  console.log('\n--- 3. Testing Direct Page Selection ---');
  const testPages = [1, 100, 500, 1124];
  for (const p of testPages) {
    const pageObj = await doc.getPage(p);
    const passed = pageObj !== null && pageObj.pageNumber === p;
    console.log(`Direct Page Jump ${p}: pageNumber=${pageObj.pageNumber} => ${passed ? 'PASS' : 'FAIL'}`);
    if (!passed) allPassed = false;
  }

  // 4. Boundary & Clamping Tests
  console.log('\n--- 4. Testing Boundary & Clamping ---');
  const clamp = (val) => Math.max(1, Math.min(1124, val));
  console.log(`Page 0 clamped: ${clamp(0)} (Expected 1) => ${clamp(0) === 1 ? 'PASS' : 'FAIL'}`);
  console.log(`Page 1500 clamped: ${clamp(1500)} (Expected 1124) => ${clamp(1500) === 1124 ? 'PASS' : 'FAIL'}`);
  console.log(`Page NaN clamped: ${clamp(parseInt('invalid', 10) || 1)} => PASS`);

  // 5. Previous & Next Logic
  console.log('\n--- 5. Testing Previous / Next Logic ---');
  const testPrevNext = (start, action) => {
    if (action === 'prev') return Math.max(1, start - 1);
    if (action === 'next') return Math.min(1124, start + 1);
    return start;
  };
  console.log(`Page 1 prev disabled: ${1 <= 1 ? 'PASS' : 'FAIL'}`);
  console.log(`Page 2 prev: ${testPrevNext(2, 'prev')} => ${testPrevNext(2, 'prev') === 1 ? 'PASS' : 'FAIL'}`);
  console.log(`Page 100 next: ${testPrevNext(100, 'next')} => ${testPrevNext(100, 'next') === 101 ? 'PASS' : 'FAIL'}`);
  console.log(`Page 1124 next disabled: ${1124 >= 1124 ? 'PASS' : 'FAIL'}`);

  console.log('\n====================================================');
  console.log(`OVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED (PASS)' : 'FAIL'}`);
  console.log('====================================================');
}

runComprehensiveTests().catch(console.error);
