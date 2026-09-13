import fs from 'fs';

const tripletResults = JSON.parse(fs.readFileSync('exact_triplet_results.json', 'utf8'));
const quranData = await import('./src/data/quranData.ts');
const surahs = quranData.SURAHS_LIST;
const quranTextPageToPdfPage = quranData.quranTextPageToPdfPage;

console.log('Comparing current quranData.ts with triplet density peak analysis...');

let diffs = 0;
const diffList = [];

for (const s of surahs) {
  const currentTextPage = s.pageStart;
  const currentPdfPage = quranTextPageToPdfPage(currentTextPage);
  const triplet = tripletResults.find(t => t.surahNum === s.number);

  if (!triplet) {
    console.log(`Missing triplet for Surah ${s.number}`);
    continue;
  }

  if (triplet.physicalPdfPage !== currentPdfPage) {
    diffs++;
    diffList.push({
      surahNum: s.number,
      surahName: s.name,
      currentPdfPage,
      detectedPdfPage: triplet.physicalPdfPage,
      diff: triplet.physicalPdfPage - currentPdfPage,
      allScores: triplet.all
    });
  }
}

console.log(`Found ${diffs} differences out of 114 Surahs:`);
for (const d of diffList) {
  console.log(`Surah ${d.surahNum.toString().padStart(3, ' ')}. ${d.surahName.padEnd(16, ' ')} -> current PDF: ${d.currentPdfPage}, detected PDF: ${d.detectedPdfPage} (Diff: ${d.diff})`);
}
