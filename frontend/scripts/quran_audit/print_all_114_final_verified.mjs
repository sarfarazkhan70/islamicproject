import fs from 'fs';

const tripletResults = JSON.parse(fs.readFileSync('exact_triplet_results.json', 'utf8'));
const quranData = await import('./src/data/quranData.ts');
const pdfPageToQuranTextPage = quranData.pdfPageToQuranTextPage;
const quranTextPageToPdfPage = quranData.quranTextPageToPdfPage;

const verifiedList = [];
for (const t of tripletResults) {
  const textPage = pdfPageToQuranTextPage(t.physicalPdfPage);
  const backPdf = quranTextPageToPdfPage(textPage);
  verifiedList.push({
    number: t.surahNum,
    name: t.surahName,
    textPage,
    physicalPdfPage: t.physicalPdfPage,
    roundtripValid: backPdf === t.physicalPdfPage
  });
}

console.table(verifiedList);
fs.writeFileSync('all_114_final_verified.json', JSON.stringify(verifiedList, null, 2));
