import fs from 'fs';
import path from 'path';

const tripletData = JSON.parse(fs.readFileSync('surah_audit_triplet_results.json', 'utf8'));

console.log('=== SURAH START PAGE AUDIT FROM PDF TRIPLET IMAGES ===\n');

for (const s of tripletData) {
  const candidate = s.files[1] || s.files[0];
  let startPage = candidate;

  if (s.pageBanners.length === 1) {
    startPage = s.pageBanners[0].page;
  } else if (s.pageBanners.length > 1) {
    // If multiple pages have banners in the triplet:
    // For Surahs at the end of a previous Surah, we take the page where the new Surah banner begins
    startPage = s.pageBanners[0].page;
  }

  console.log(`Surah ${String(s.surahNum).padStart(3, ' ')}. ${s.surahName.padEnd(20, ' ')} -> Candidate: ${String(candidate).padStart(4, ' ')} | Resolved: ${String(startPage).padStart(4, ' ')}`);
}
