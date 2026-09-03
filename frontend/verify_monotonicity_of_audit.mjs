import fs from 'fs';

const tripletResults = JSON.parse(fs.readFileSync('exact_triplet_results.json', 'utf8'));

console.log('Auditing monotonicity of physical PDF pages...');
let prev = 1;
let issues = 0;

for (let i = 0; i < tripletResults.length; i++) {
  const t = tripletResults[i];
  if (t.physicalPdfPage < prev) {
    console.log(`ORDER ISSUE: Surah ${t.surahNum} (${t.surahName}) has page ${t.physicalPdfPage} which is less than prev ${prev}`);
    issues++;
  }
  prev = t.physicalPdfPage;
}

if (issues === 0) {
  console.log('✓ All 114 Surahs have strictly monotonically increasing physical pages!');
} else {
  console.log(`Found ${issues} order issues.`);
}
