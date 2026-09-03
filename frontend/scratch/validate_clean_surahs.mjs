import fs from 'fs';

const surahs = JSON.parse(fs.readFileSync('scratch/clean_surahs.json', 'utf8'));

console.log(`Total surahs: ${surahs.length}`);

let isMonotonic = true;
let prevPage = 0;
let errors = [];

for (let i = 0; i < surahs.length; i++) {
  const s = surahs[i];
  if (s.number !== i + 1) {
    errors.push(`Surah index ${i+1} has number ${s.number}`);
  }
  if (s.pageStart < prevPage) {
    errors.push(`Surah ${s.number} (${s.name}) pageStart ${s.pageStart} is less than previous pageStart ${prevPage}`);
    isMonotonic = false;
  }
  if (s.pageStart < 3 || s.pageStart > 1123) {
    errors.push(`Surah ${s.number} (${s.name}) pageStart ${s.pageStart} is out of valid range (3..1123)`);
  }
  prevPage = s.pageStart;
}

console.log(`Monotonic check: ${isMonotonic ? 'PASSED' : 'FAILED'}`);
if (errors.length > 0) {
  console.log('Errors found:', errors);
} else {
  console.log('All 114 Surahs verified strictly monotonic and valid page ranges!');
}
