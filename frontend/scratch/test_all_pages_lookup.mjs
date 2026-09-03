import {
  SURAHS_LIST,
  JUZ_LIST,
  TOTAL_MUSHAF_PDF_PAGES,
  getSurahByPage,
  getJuzByPage,
  getSurahByNumber
} from '../src/data/quranData.ts';

console.log('Testing getSurahByPage and getJuzByPage for all 1124 pages...');

let errors = 0;
for (let p = 1; p <= TOTAL_MUSHAF_PDF_PAGES; p++) {
  const surah = getSurahByPage(p);
  const juz = getJuzByPage(p);
  if (!surah || typeof surah.number !== 'number' || surah.number < 1 || surah.number > 114) {
    console.error(`Page ${p}: Invalid Surah meta`, surah);
    errors++;
  }
  if (!juz || typeof juz.number !== 'number' || juz.number < 1 || juz.number > 30) {
    console.error(`Page ${p}: Invalid Juz meta`, juz);
    errors++;
  }
}

console.log(`Page traversal test completed. Errors found: ${errors}`);
